from sqlalchemy import Numeric

from . import db
from datetime import timezone, datetime
from enum import Enum as PyEnum
from sqlalchemy.orm import validates
import re
from decimal import Decimal


class ThemeColor(db.Model):
    """Stores system theme colors and UI configuration"""

    __tablename__ = "theme_colors"

    id = db.Column(db.Integer, primary_key=True)
    # Primary colors
    primary_color = db.Column(
        db.String(7), nullable=False, default="#f5a030"
    )  # Hex code
    secondary_color = db.Column(db.String(7), nullable=False, default="#37b137")
    accent_color = db.Column(db.String(7), nullable=False, default="#37b137")

    # UI elements
    background_color = db.Column(db.String(7), default="#FFFFFF")
    text_color = db.Column(db.String(7), default="#1F2937")
    border_color = db.Column(db.String(7), default="#D1D5DB")

    # Logo and branding
    logo_url = db.Column(db.String(500), nullable=True)
    favicon_url = db.Column(db.String(500), nullable=True)
    company_name = db.Column(db.String(200), nullable=False, default="ECOVIBE")

    # Additional styling
    border_radius = db.Column(db.String(10), default="8px")  # e.g., "8px", "12px"
    font_family = db.Column(db.String(100), default="'Inter', sans-serif")

    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @validates(
        "primary_color",
        "secondary_color",
        "accent_color",
        "background_color",
        "text_color",
        "border_color",
    )
    def validate_hex_color(self, key, color):
        """Validate hex color format"""
        if color and not re.match(r"^#(?:[0-9a-fA-F]{3}){1,2}$", color):
            raise ValueError(f"{key} must be a valid hex color code")
        return color


class Bank(db.Model):
    """Master data for supported banks"""

    __tablename__ = "banks"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(
        db.String(10), nullable=False, unique=True
    )  # Bank code e.g., "01", "02"
    swift_code = db.Column(db.String(20), nullable=True)

    # Bank account details for receiving payments
    account_name = db.Column(db.String(200), nullable=False)
    account_number = db.Column(db.String(50), nullable=False)
    branch = db.Column(db.String(100), nullable=True)
    currency = db.Column(db.String(10), nullable=False, default="KES")

    # Status and ordering
    is_active = db.Column(db.Boolean, default=True)
    display_order = db.Column(db.Integer, default=0)  # For sorting in dropdowns

    # Additional info
    logo_url = db.Column(db.String(500), nullable=True)
    website = db.Column(db.String(200), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @validates("account_number")
    def validate_account_number(self, key, account_number):
        """Validate account number format"""
        if not re.match(r"^[0-9]{1,50}$", account_number):
            raise ValueError(
                "Account number must contain " "only digits and be 1-50 characters long"
            )
        return account_number


class PaybillConfig(db.Model):
    """Master data for paybill numbers and configurations"""

    __tablename__ = "paybill_configs"

    id = db.Column(db.Integer, primary_key=True)
    paybill_number = db.Column(db.String(20), nullable=False, unique=True)
    business_name = db.Column(db.String(200), nullable=False)

    # Provider details
    provider = db.Column(db.String(50), nullable=False)  # mpesa, airtel, equitel, etc.
    provider_type = db.Column(db.String(50), nullable=False)  # paybill, till

    # API credentials (store encrypted in production)
    consumer_key = db.Column(db.String(500), nullable=True)
    consumer_secret = db.Column(db.String(500), nullable=True)
    passkey = db.Column(db.String(500), nullable=True)

    # Security - In production, you should encrypt these
    is_encrypted = db.Column(db.Boolean, default=False)

    # Configuration
    is_active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)

    # Transaction limits
    min_amount = db.Column(Numeric(12, 2), default=Decimal("1.00"))
    max_amount = db.Column(Numeric(12, 2), default=Decimal("150000.00"))

    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @validates("paybill_number")
    def validate_paybill_number(self, key, paybill_number):
        """Validate paybill number format"""
        if not re.match(r"^[0-9]{5,10}$", paybill_number):
            raise ValueError(
                "Paybill number must contain " "only digits and be 5-10 characters long"
            )
        return paybill_number


class EmailConfig(db.Model):
    """Email configuration for system notifications"""

    __tablename__ = "email_configs"

    id = db.Column(db.Integer, primary_key=True)

    # SMTP Configuration
    smtp_server = db.Column(db.String(200), nullable=False)
    smtp_port = db.Column(db.Integer, nullable=False, default=587)
    use_tls = db.Column(db.Boolean, default=True)
    use_ssl = db.Column(db.Boolean, default=False)

    # Credentials (should be encrypted in production)
    username = db.Column(db.String(200), nullable=False)
    password = db.Column(db.String(500), nullable=False)  # Encrypted
    is_encrypted = db.Column(db.Boolean, default=False)

    # Email addresses
    from_email = db.Column(db.String(200), nullable=False)
    from_name = db.Column(db.String(200), nullable=False)
    admin_email = db.Column(db.String(200), nullable=False)  # For system notifications

    # Configuration
    is_active = db.Column(db.Boolean, default=True)
    daily_limit = db.Column(db.Integer, default=500)  # Daily email sending limit

    # Test configuration
    last_test_status = db.Column(db.Boolean, nullable=True)
    last_test_at = db.Column(db.DateTime(timezone=True), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @validates("smtp_port")
    def validate_smtp_port(self, key, port):
        """Validate SMTP port"""
        if not (1 <= port <= 65535):
            raise ValueError("SMTP port must be between 1 and 65535")
        return port

    @validates("from_email", "admin_email")
    def validate_email(self, key, email):
        """Basic email validation"""
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
            raise ValueError(f"{key} must be a valid email address")
        return email


class SystemConfig(db.Model):
    """General system configuration"""

    __tablename__ = "system_configs"

    id = db.Column(db.Integer, primary_key=True)

    # Company Information
    company_name = db.Column(db.String(200), nullable=False)
    company_address = db.Column(db.Text, nullable=True)
    company_phone = db.Column(db.String(20), nullable=True)
    company_email = db.Column(db.String(200), nullable=True)
    company_website = db.Column(db.String(200), nullable=True)

    # Business Information
    business_reg_number = db.Column(db.String(100), nullable=True)
    tax_id = db.Column(db.String(100), nullable=True)  # KRA PIN, VAT number, etc.

    # Currency and Localization
    default_currency = db.Column(db.String(10), nullable=False, default="KES")
    timezone = db.Column(db.String(50), nullable=False, default="Africa/Nairobi")
    date_format = db.Column(db.String(20), default="DD/MM/YYYY")
    language = db.Column(db.String(10), default="en")

    # Invoice Settings
    invoice_prefix = db.Column(db.String(10), default="INV")
    invoice_start_number = db.Column(db.Integer, default=1000)
    invoice_terms = db.Column(db.Text, nullable=True)
    invoice_notes = db.Column(db.Text, nullable=True)

    # Payment Settings
    payment_terms_days = db.Column(db.Integer, default=30)
    late_fee_percentage = db.Column(Numeric(5, 2), default=Decimal("5.00"))

    # Security Settings
    admin_session_timeout = db.Column(db.Integer, default=60)  # minutes
    user_session_timeout = db.Column(db.Integer, default=30)  # minutes
    max_login_attempts = db.Column(db.Integer, default=5)

    # File Upload Settings
    max_file_size_mb = db.Column(db.Integer, default=10)  # MB
    allowed_file_types = db.Column(db.String(500), default="jpg,jpeg,png,pdf,doc,docx")

    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class NotificationTemplate(db.Model):
    """Templates for system notifications and emails"""

    __tablename__ = "notification_templates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    template_type = db.Column(db.String(50), nullable=False)  # email, sms, push
    subject = db.Column(db.String(200), nullable=True)
    body = db.Column(db.Text, nullable=False)

    # Variables that can be used in templates e.g.,
    # {{customer_name}}, {{invoice_amount}}
    available_variables = db.Column(db.Text, nullable=True)

    is_active = db.Column(db.Boolean, default=True)
    is_system = db.Column(db.Boolean, default=False)

    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class TaxConfig(db.Model):
    """Tax rates and configurations"""

    __tablename__ = "tax_configs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # e.g., "VAT", "Sales Tax"
    rate = db.Column(Numeric(5, 2), nullable=False)  # Percentage
    tax_type = db.Column(db.String(50), nullable=False)  # percentage, fixed_amount
    tax_number = db.Column(db.String(100), nullable=True)  # Tax identification number

    is_active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)

    # Applicable to
    applies_to_products = db.Column(db.Boolean, default=True)
    applies_to_services = db.Column(db.Boolean, default=True)

    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @validates("rate")
    def validate_tax_rate(self, key, rate):
        """Validate tax rate"""
        if rate < 0:
            raise ValueError("Tax rate cannot be negative")
        return rate


# Utility functions for master data
class MasterDataManager:
    """Helper class for managing master data"""

    @staticmethod
    def get_active_banks():
        """Get all active banks"""
        return (
            Bank.query.filter_by(is_active=True)
            .order_by(Bank.display_order, Bank.name)
            .all()
        )

    @staticmethod
    def get_active_paybills():
        """Get all active paybill configurations"""
        return (
            PaybillConfig.query.filter_by(is_active=True)
            .order_by(PaybillConfig.provider)
            .all()
        )

    @staticmethod
    def get_default_paybill():
        """Get the default paybill configuration"""
        return PaybillConfig.query.filter_by(is_active=True, is_default=True).first()

    @staticmethod
    def get_system_config():
        """Get system configuration (singleton)"""
        config = SystemConfig.query.first()
        if not config:
            # Create default configuration if none exists
            config = SystemConfig(company_name="Your Company")
            db.session.add(config)
            db.session.commit()
        return config

    @staticmethod
    def get_active_theme():
        """Get active theme configuration"""
        theme = ThemeColor.query.filter_by(is_active=True).first()
        if not theme:
            # Create default theme if none exists
            theme = ThemeColor()
            db.session.add(theme)
            db.session.commit()
        return theme

    @staticmethod
    def get_email_config():
        """Get email configuration"""
        return EmailConfig.query.filter_by(is_active=True).first()

    @staticmethod
    def get_tax_rates():
        """Get all active tax rates"""
        return TaxConfig.query.filter_by(is_active=True).all()

    @staticmethod
    def get_default_tax():
        """Get default tax rate"""
        return TaxConfig.query.filter_by(is_active=True, is_default=True).first()
