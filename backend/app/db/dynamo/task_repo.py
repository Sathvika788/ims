from typing import Optional
import uuid
from datetime import datetime
from app.db.dynamo.client import dynamodb
from botocore.exceptions import ClientError

TABLE_NAME = "IMS"


def create_task(intern_id: str, title: str, description: str, due_date: str, priority: str, assigned_by: str) -> dict:
    """Create a task for an intern"""
    task_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    item = {
        'PK': {'S': f'TASK#{task_id}'},
        'SK': {'S': 'TASK'},
        'GSI1PK': {'S': f'INTERN_TASKS#{intern_id}'},
        'GSI1SK': {'S': f'TASK#{task_id}'},
        'id': {'S': task_id},
        'intern_id': {'S': intern_id},
        'title': {'S': title},
        'description': {'S': description},
        'due_date': {'S': due_date},
        'priority': {'S': priority},
        'status': {'S': 'pending'},
        'assigned_by': {'S': assigned_by},
        'created_at': {'S': timestamp}
    }
    
    try:
        dynamodb.put_item(TableName=TABLE_NAME, Item=item)
        
        return {
            'id': task_id,
            'intern_id': intern_id,
            'title': title,
            'description': description,
            'due_date': due_date,
            'priority': priority,
            'status': 'pending',
            'assigned_by': assigned_by,
            'created_at': timestamp
        }
    except ClientError:
        raise


def get_task(task_id: str) -> Optional[dict]:
    """Get task by ID"""
    try:
        response = dynamodb.get_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'TASK#{task_id}'}, 'SK': {'S': 'TASK'}}
        )
        
        if 'Item' not in response:
            return None
        
        item = response['Item']
        return {
            'id': item['id']['S'],
            'intern_id': item['intern_id']['S'],
            'title': item['title']['S'],
            'description': item['description']['S'],
            'due_date': item['due_date']['S'],
            'priority': item['priority']['S'],
            'status': item['status']['S'],
            'assigned_by': item['assigned_by']['S'],
            'created_at': item['created_at']['S']
        }
    except ClientError:
        return None


def get_tasks_by_intern(intern_id: str) -> list:
    """Get all tasks for an intern"""
    try:
        response = dynamodb.query(
            TableName=TABLE_NAME,
            IndexName='GSI1',
            KeyConditionExpression='GSI1PK = :intern',
            ExpressionAttributeValues={':intern': {'S': f'INTERN_TASKS#{intern_id}'}}
        )
        
        tasks = []
        for item in response.get('Items', []):
            tasks.append({
                'id': item['id']['S'],
                'intern_id': item['intern_id']['S'],
                'title': item['title']['S'],
                'description': item['description']['S'],
                'due_date': item['due_date']['S'],
                'priority': item['priority']['S'],
                'status': item['status']['S'],
                'assigned_by': item['assigned_by']['S'],
                'created_at': item['created_at']['S']
            })
        
        return sorted(tasks, key=lambda x: x['due_date'])
    except ClientError:
        return []


def update_task_status(task_id: str, status: str) -> bool:
    """Update task status"""
    try:
        dynamodb.update_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'TASK#{task_id}'}, 'SK': {'S': 'TASK'}},
            UpdateExpression='SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':status': {'S': status},
                ':updated_at': {'S': datetime.utcnow().isoformat()}
            },
            ExpressionAttributeNames={'#status': 'status'}
        )
        return True
    except ClientError:
        return False


def update_task(task_id: str, updates: dict) -> bool:
    """Update task fields"""
    try:
        update_expr_parts = []
        expr_attr_values = {}
        expr_attr_names = {}
        
        for key, value in updates.items():
            safe_key = f'attr_{key}'
            update_expr_parts.append(f'#{safe_key} = :{safe_key}')
            expr_attr_names[f'#{safe_key}'] = key
            expr_attr_values[f':{safe_key}'] = {'S': str(value)}
        
        if not update_expr_parts:
            return False
        
        update_expr_parts.append('#updated_at = :updated_at')
        expr_attr_names['#updated_at'] = 'updated_at'
        expr_attr_values[':updated_at'] = {'S': datetime.utcnow().isoformat()}
        
        dynamodb.update_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'TASK#{task_id}'}, 'SK': {'S': 'TASK'}},
            UpdateExpression='SET ' + ', '.join(update_expr_parts),
            ExpressionAttributeValues=expr_attr_values,
            ExpressionAttributeNames=expr_attr_names
        )
        
        return True
    except ClientError:
        return False


def delete_task(task_id: str) -> bool:
    """Delete a task"""
    try:
        dynamodb.delete_item(
            TableName=TABLE_NAME,
            Key={'PK': {'S': f'TASK#{task_id}'}, 'SK': {'S': 'TASK'}}
        )
        return True
    except ClientError:
        return False
