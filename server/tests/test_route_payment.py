# TODO
# import pytest
# from datetime import datetime, timezone
# from flask_jwt_extended import create_access_token
# from models import db
# from models.user import User, Role, AccountStatus
# from models.invoice import Invoice, InvoiceStatus
# from models.payment import Payment, PaymentMethod, MpesaTransaction, CashTransaction


# # ------------------------------
# # Fixtures
# # ------------------------------
# @pytest.fixture
# def admin_user(session):
#     user = User(
#         full_name="Admin Tester",
#         email="admin@test.com",
#         phone_number="+254700000000",
#         industry="Tech",
#         role=Role.ADMIN,
#         account_status=AccountStatus.ACTIVE,
#     )
#     user.set_password("Password123")
#     session.add(user)
#     session.commit()
#     return user


# @pytest.fixture
# def auth_header(admin_user):
#     token = create_access_token(identity=str(admin_user.id))
#     return {"Authorization": f"Bearer {token}"}


# @pytest.fixture
# def invoice(session, admin_user):
#     inv = Invoice(
#         client_id=admin_user.id,
#         amount=1000,
#         status=InvoiceStatus.pending,
#         created_at=datetime.now(timezone.utc),
#     )
#     session.add(inv)
#     session.commit()
#     return inv


# @pytest.fixture
# def mpesa_tx(session):
#     tx = MpesaTransaction(metadata={"amount": 1000})
#     session.add(tx)
#     session.commit()
#     return tx


# @pytest.fixture
# def cash_tx(session):
#     tx = CashTransaction(metadata={"amount": 500})
#     session.add(tx)
#     session.commit()
#     return tx


# # ------------------------------
# # Tests
# # ------------------------------

# def test_create_payment_mpesa(client, session, auth_header, invoice, mpesa_tx):
#     payload = {
#         "invoice_id": invoice.id,
#         "payment_method": "mpesa",
#         "payment_method_id": mpesa_tx.id,
#     }

#     response = client.post("/api/payments", json=payload, headers=auth_header)
#     body = response.get_json()

#     assert response.status_code == 201
#     assert body["status"] == "success"
#     assert body["data"]["invoice_id"] == invoice.id

#     payment = session.query(Payment).first()
#     assert payment.payment_method == PaymentMethod.MPESA


# def test_create_payment_cash(client, session, auth_header, invoice, cash_tx):
#     payload = {
#         "invoice_id": invoice.id,
#         "payment_method": "cash",
#         "payment_method_id": cash_tx.id,
#     }

#     response = client.post("/api/payments", json=payload, headers=auth_header)
#     body = response.get_json()

#     assert response.status_code == 201
#     assert body["status"] == "success"
#     assert body["data"]["invoice_id"] == invoice.id


# def test_get_payments(client, session, auth_header, invoice, mpesa_tx):
#     p = Payment(
#         invoice_id=invoice.id,
#         payment_method=PaymentMethod.MPESA,
#         payment_method_id=mpesa_tx.id,
#         created_at=datetime.now(timezone.utc),
#     )
#     session.add(p)
#     session.commit()

#     response = client.get("/api/payments", headers=auth_header)
#     body = response.get_json()

#     assert response.status_code == 200
#     assert any(item["invoice_id"] == invoice.id for item in body["data"])


# def test_update_payment(client, session, auth_header, invoice, cash_tx):
#     p = Payment(
#         invoice_id=invoice.id,
#         payment_method=PaymentMethod.CASH,
#         payment_method_id=cash_tx.id,
#         created_at=datetime.now(timezone.utc),
#     )
#     session.add(p)
#     session.commit()

#     payload = {"payment_method": "mpesa", "payment_method_id": cash_tx.id}
#     response = client.put(f"/api/payments/{p.id}", json=payload, headers=auth_header)
#     body = response.get_json()

#     assert response.status_code == 200
#     assert body["status"] == "success"


# def test_delete_payment(client, session, auth_header, invoice, mpesa_tx):
#     p = Payment(
#         invoice_id=invoice.id,
#         payment_method=PaymentMethod.MPESA,
#         payment_method_id=mpesa_tx.id,
#         created_at=datetime.now(timezone.utc),
#     )
#     session.add(p)
#     session.commit()

#     response = client.delete(f"/api/payments/{p.id}", headers=auth_header)
#     body = response.get_json()

#     assert response.status_code == 200
#     assert body["message"] == "Payment deleted successfully"
#     assert session.query(Payment).get(p.id) is None
