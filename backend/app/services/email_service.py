import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

ses_client = boto3.client(
    'ses',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)


def send_email(to_email: str, subject: str, body_html: str) -> bool:
    """Send email via AWS SES"""
    try:
        response = ses_client.send_email(
            Source=settings.SES_SENDER_EMAIL,
            Destination={'ToAddresses': [to_email]},
            Message={
                'Subject': {'Data': subject, 'Charset': 'UTF-8'},
                'Body': {'Html': {'Data': body_html, 'Charset': 'UTF-8'}}
            }
        )
        return True
    except ClientError as e:
        print(f"[SES] Failed to send email to {to_email}: {e}")
        return False


def send_stipend_calculated_email(intern_email: str, intern_name: str, month: str, total_amount: float):
    """Send stipend calculation notification"""
    subject = f"Stipend Calculated for {month}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #00d4aa;">Stipend Calculated</h2>
        <p>Hello {intern_name},</p>
        <p>Your stipend for <strong>{month}</strong> has been calculated.</p>
        <p><strong>Total Amount: ₹{total_amount:.2f}</strong></p>
        <p>Please log in to the Intern Management System to view the breakdown.</p>
        <br>
        <p>Best regards,<br>IMS Team</p>
    </body>
    </html>
    """
    return send_email(intern_email, subject, body)


def send_daily_reminder_email(intern_email: str, intern_name: str):
    """Send daily work log reminder"""
    subject = "Reminder: Submit Your Daily Work Log"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #f97316;">Daily Log Reminder</h2>
        <p>Hello {intern_name},</p>
        <p>You haven't submitted your daily work log yet for today.</p>
        <p>Please log in and submit your work log before the end of the day.</p>
        <p><a href="{settings.FRONTEND_URL}/intern/logs" style="background: #00d4aa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Submit Log</a></p>
        <br>
        <p>Best regards,<br>IMS Team</p>
    </body>
    </html>
    """
    return send_email(intern_email, subject, body)
