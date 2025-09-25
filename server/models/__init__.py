from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


from .blog import Blog  # noqa: E402
from .booking import Booking  # noqa: E402
from .comment import Comment  # noqa: E402
from .document import Document  # noqa: E402
from .invoice import Invoice  # noqa: E402
from .newsletter_subscriber import NewsletterSubscriber  # noqa: E402
from .payment import Payment  # noqa: E402
from .service import Service  # noqa: E402
from .ticket_message import TicketMessage  # noqa: E402
from .ticket import Ticket  # noqa: E402
from .token import Token  # noqa: E402
from .user import User  # noqa: E402
