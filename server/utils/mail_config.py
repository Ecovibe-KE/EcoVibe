import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)
load_dotenv()
# Load configs from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
SMTP_REPLY_EMAIL = os.getenv("SMTP_REPLY_EMAIL")

logger.debug(f"SMTP_SERVER: {SMTP_SERVER}")
logger.debug(f"SMTP_PORT: {SMTP_PORT}")
logger.debug(f"SMTP_USER: {SMTP_USER}")
logger.debug(f"SMTP_PASS: {'*' * len(SMTP_PASS) if SMTP_PASS else 'None'}")


def send_email(to_email: str, subject: str, body: str, is_html=False):
    """Send an email with logging for debugging."""
    try:
        logger.debug("Preparing email...")
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject
        msg["Reply-To"] = SMTP_REPLY_EMAIL

        # Attach body as HTML or plain text
        if is_html:
            msg.attach(MIMEText(body, "html"))
        else:
            msg.attach(MIMEText(body, "plain"))

        if SMTP_PORT == 465:
            logger.debug("Using SMTP_SSL for %s:%s", SMTP_SERVER, SMTP_PORT)
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        else:
            logger.debug("Using SMTP with STARTTLS for %s:%s", SMTP_SERVER, SMTP_PORT)
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()

        with server:
            logger.debug("Logging in as %s", SMTP_USER)
            server.login(SMTP_USER, SMTP_PASS)
            logger.debug("Sending email to %s", to_email)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        logger.info("Email successfully sent to %s", to_email)

    except Exception as e:
        logger.error("Failed to send email: %s", e, exc_info=True)

