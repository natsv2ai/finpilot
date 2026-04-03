import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """Send a password reset email with the reset link."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    if not settings.SMTP_HOST:
        # SMTP not configured — log the reset link instead
        print(f"[FinPilot] Password reset link for {to_email}: {reset_url}")
        return True

    html_body = f"""
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #4f46e5); display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 20px; font-weight: bold;">F</span>
            </div>
            <h2 style="margin-top: 12px; color: #1e293b;">Reset Your Password</h2>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            You requested a password reset for your FinPilot account. Click the button below to set a new password.
            This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{reset_url}" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Reset Password
            </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email.
            <br>— FinPilot Team
        </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = "FinPilot — Password Reset"
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[FinPilot] Failed to send email: {e}")
        # Fallback — log the link
        print(f"[FinPilot] Password reset link for {to_email}: {reset_url}")
        return True
