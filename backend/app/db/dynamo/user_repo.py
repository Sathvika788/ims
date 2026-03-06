from typing import Optional
import uuid
from datetime import datetime
from app.db.dynamo.client import dynamodb
from botocore.exceptions import ClientError

TABLE_NAME = "IMS"


def create_user(email: str, password_hash: str, role: str, name: str) -> dict:
    """Create user with email index using transaction"""
    user_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    user_item = {
        'PK': {'S': f'USER#{user_id}'},
        'SK': {'S': 'PROFILE'},
        'GSI1PK': {'S': f'ROLE#{role}'},
        'GSI1SK': {'S': f'USER#{user_id}'},
        'id': {'S': user_id},
        'email': {'S': email},
        'password_hash': {'S': password_hash},
        'role': {'S': role},
        'name': {'S': name},
        'created_at': {'S': timestamp}
    }
    
    email_index_item = {
        'PK': {'S': f'EMAIL#{email}'},
        'SK': {'S': 'USER_ID'},
        'user_id': {'S': user_id}
    }
    
    try:
        dynamodb.transact_write_items(
            TransactItems=[
                {'Put': {'TableName': TABLE_NAME, 'Item': user_item}},
                {'Put': {'TableName': TABLE_NAME, 'Item': email_index_item, 'ConditionExpression': 'attribute_not_exists(PK)'}}
            ]
        )
        
        return {
            'id': user_id,
            'email': email,
            'role': role,
            'name': name,
            'created_at': timestamp
        }
    except ClientError as e:
        if e.response['Error']['Code'] == 'TransactionCanceledException':
            raise ValueError("Email already registered")
        raise


def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email using email index"""
    try:
        # First get user_id from email index
        response = dynamodb.get_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'EMAIL#{email}'}, 'SK': {'S': 'USER_ID'}}
        )
        
        if 'Item' not in response:
            return None
        
        user_id = response['Item']['user_id']['S']
        
        # Then get full user profile
        response = dynamodb.get_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'USER#{user_id}'}, 'SK': {'S': 'PROFILE'}}
        )
        
        if 'Item' not in response:
            return None
        
        item = response['Item']
        return {
            'id': item['id']['S'],
            'email': item['email']['S'],
            'password_hash': item['password_hash']['S'],
            'role': item['role']['S'],
            'name': item['name']['S'],
            'created_at': item['created_at']['S']
        }
    except ClientError:
        return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    try:
        response = dynamodb.get_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'USER#{user_id}'}, 'SK': {'S': 'PROFILE'}}
        )
        
        if 'Item' not in response:
            return None
        
        item = response['Item']
        return {
            'id': item['id']['S'],
            'email': item['email']['S'],
            'password_hash': item.get('password_hash', {}).get('S', ''),
            'role': item['role']['S'],
            'name': item['name']['S'],
            'created_at': item['created_at']['S']
        }
    except ClientError:
        return None


def get_users_by_role(role: str) -> list:
    """Get all users with a specific role"""
    try:
        response = dynamodb.query(
            TableName=TABLE_NAME,
            IndexName='GSI1',
            KeyConditionExpression='GSI1PK = :role',
            ExpressionAttributeValues={':role': {'S': f'ROLE#{role}'}}
        )
        
        users = []
        for item in response.get('Items', []):
            users.append({
                'id': item['id']['S'],
                'email': item['email']['S'],
                'role': item['role']['S'],
                'name': item['name']['S'],
                'created_at': item['created_at']['S']
            })
        
        return users
    except ClientError:
        return []


def update_user(user_id: str, updates: dict) -> bool:
    """Update user fields"""
    try:
        update_expr_parts = []
        expr_attr_values = {}
        
        for key, value in updates.items():
            update_expr_parts.append(f'{key} = :{key}')
            expr_attr_values[f':{key}'] = {'S': str(value)}
        
        if not update_expr_parts:
            return False
        
        dynamodb.update_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'USER#{user_id}'}, 'SK': {'S': 'PROFILE'}},
            UpdateExpression='SET ' + ', '.join(update_expr_parts),
            ExpressionAttributeValues=expr_attr_values
        )
        
        return True
    except ClientError:
        return False
