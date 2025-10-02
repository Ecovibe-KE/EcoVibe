# seed_users_and_services.py

from app import create_app, db
from models.user import User
from models.service import Service
from werkzeug.security import generate_password_hash
from sqlalchemy import text

app = create_app()
with app.app_context():
    # 🚨 Reset tables with cascade (drops dependent rows too)
    db.session.execute(text("TRUNCATE TABLE blogs RESTART IDENTITY CASCADE;"))
    db.session.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE;"))
    db.session.execute(text("TRUNCATE TABLE services RESTART IDENTITY CASCADE;"))
    db.session.commit()

    # 👤 Seed Users
    admin = User(
        full_name="Admin User",
        email="admin@example.com",
        password=generate_password_hash("admin123"),
        role="admin",
    )

    client = User(
        full_name="Client User",
        email="client@example.com",
        password=generate_password_hash("client123"),
        role="client",
    )

    db.session.add_all([admin, client])
    db.session.commit()

    # 🛠️ Seed Services
    service1 = Service(name="Haircut", description="Basic haircut service", price=20.0)
    service2 = Service(name="Massage", description="Relaxing 60 min massage", price=50.0)
    service3 = Service(name="Manicure", description="Full manicure treatment", price=30.0)

    db.session.add_all([service1, service2, service3])
    db.session.commit()

    print("✅ Seeded users and services successfully!")
