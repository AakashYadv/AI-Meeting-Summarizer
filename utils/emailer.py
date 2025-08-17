import os
import smtplib
from email.utils import parseaddr
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Optional: SendGrid
try:
    import sendgrid
    from sendgrid.helpers.mail import Mail, To, From
except Exception:
    sendgrid = None  # Optional dependency


def _validate_emails(to_emails):
    cleaned = []
    for addr in to_emails:
        name, email = parseaddr(addr)
        if "@" in email and "." in email.split("@")[-1]:
            cleaned.append(email)
    if not cleaned:
        raise ValueError("No valid recipient emails provided")
    return cleaned


def _send_via_sendgrid(to_emails, subject, body_markdown):
    api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("SENDGRID_FROM_EMAIL")
    if not api_key or not from_email:
        raise RuntimeError("SENDGRID_API_KEY or SENDGRID_FROM_EMAIL not set")
    sg = sendgrid.SendGridAPIClient(api_key=api_key)
    mail = Mail(
        from_email=From(from_email),
        to_emails=[To(addr) for addr in to_emails],
        subject=subject,
        html_content=f"<pre style='font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre-wrap'>{body_markdown}</pre>",
    )
    return sg.send(mail)


def _send_via_smtp(to_emails, subject, body_markdown):
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    if not username or not password:
        raise RuntimeError("SMTP_USERNAME or SMTP_PASSWORD not set")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = username
    msg["To"] = ", ".join(to_emails)
    # Plain text fallback + simple HTML
    plain = body_markdown
    html = f"<pre style='font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre-wrap'>{body_markdown}</pre>"
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(host, port) as server:
        if use_tls:
            server.starttls()
        server.login(username, password)
        server.sendmail(username, to_emails, msg.as_string())


def send_email(to_emails, subject, body_markdown):
    """
    Tries SendGrid first (if configured), then falls back to SMTP.
    """
    to_emails = _validate_emails(to_emails)
    try:
        if sendgrid and os.getenv("SENDGRID_API_KEY"):
            return _send_via_sendgrid(to_emails, subject, body_markdown)
    except Exception:
        # fall back to SMTP
        pass
    return _send_via_smtp(to_emails, subject, body_markdown)
