import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration."""

    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "a_default_secret_key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FLASK_CORS_ALLOWED_ORIGINS = os.getenv(
        "FLASK_CORS_ALLOWED_ORIGINS", "http://localhost:5173"
    ).split(",")


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("FLASK_SQLALCHEMY_DATABASE_URI")


class StagingConfig(Config):
    """Staging configuration."""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("FLASK_STAGING_DATABASE_URI")


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("FLASK_PROD_DATABASE_URI")


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("FLASK_TEST_SQLALCHEMY_DATABASE_URI")


class IntegrationConfig(Config):
    """Integration configuration."""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("FLASK_INTEGRATION_DATABASE_URI")


config_by_name = {
    "development": DevelopmentConfig,
    "staging": StagingConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "integration": IntegrationConfig,
}
