import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)
load_dotenv()

# Loading configs from environment variables
FLASK_SMTP_SERVER = os.getenv("FLASK_SMTP_SERVER")
FLASK_SMTP_PORT = int(os.getenv("FLASK_SMTP_PORT", 465))
FLASK_SMTP_USER = os.getenv("FLASK_SMTP_USER")
FLASK_SMTP_PASS = os.getenv("FLASK_SMTP_PASS")
FLASK_ADMIN_EMAIL = os.getenv("FLASK_ADMIN_EMAIL")
FLASK_SMTP_REPLY_EMAIL = os.getenv("FLASK_SMTP_REPLY_EMAIL")

ENVIRONMENT = os.getenv("FLASK_DEBUG")
IS_DEBUG = ENVIRONMENT == "1"

# Debug logging function that only runs in debug mode
def debug_log(message, *args):
    if IS_DEBUG:
        logger.debug(message, *args)

if IS_DEBUG:
    logger.debug(f"SMTP_SERVER: {FLASK_SMTP_SERVER}")
    logger.debug(f"SMTP_PORT: {FLASK_SMTP_PORT}")
    logger.debug(f"SMTP_USER: {FLASK_SMTP_USER}")
    logger.debug(f"SMTP_PASS: {'*' * len(FLASK_SMTP_PASS) if FLASK_SMTP_PASS else 'None'}")

def send_email(to_email: str, subject: str, body: str, is_html=False):
    """Send an email with logging for debugging."""
    try:
        debug_log("Preparing email...")
        msg = MIMEMultipart()
        msg["From"] = FLASK_SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject
        msg["Reply-To"] = FLASK_SMTP_REPLY_EMAIL

        # Attach body as HTML or plain text
        if is_html:
            msg.attach(MIMEText(body, "html"))
        else:
            msg.attach(MIMEText(body, "plain"))

        # Create the server inside the context manager
        if FLASK_SMTP_PORT == 465:
            debug_log("Using SMTP_SSL for %s:%s", FLASK_SMTP_SERVER, FLASK_SMTP_PORT)
            with smtplib.SMTP_SSL(FLASK_SMTP_SERVER, FLASK_SMTP_PORT) as server:
                debug_log("Logging in as %s", FLASK_SMTP_USER)
                server.login(FLASK_SMTP_USER, FLASK_SMTP_PASS)
                debug_log("Sending email to %s", to_email)
                server.sendmail(FLASK_SMTP_USER, to_email, msg.as_string())
        else:
            debug_log("Using SMTP with STARTTLS for %s:%s", FLASK_SMTP_SERVER, FLASK_SMTP_PORT)
            with smtplib.SMTP(FLASK_SMTP_SERVER, FLASK_SMTP_PORT) as server:
                server.starttls()
                debug_log("Logging in as %s", FLASK_SMTP_USER)
                server.login(FLASK_SMTP_USER, FLASK_SMTP_PASS)
                debug_log("Sending email to %s", to_email)
                server.sendmail(FLASK_SMTP_USER, to_email, msg.as_string())

        logger.info("Email successfully sent to %s", to_email)
        return True, "Email sent successfully"
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed: {e}")
        return False, f"Authentication failed: {str(e)}"
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred: {e}")
        return False, f"SMTP error: {str(e)}"
    except Exception as e:
        logger.error("Failed to send email: %s", e, exc_info=True)
        error_msg = f"SMTP error: {str(e)}"
        return False, error_msg