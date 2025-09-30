# TODO
# import pytest
# import routes.payment as payment  # use short path since no __init__.py

# # --------------------------------------------------------
# # JWT bypass fixture
# # --------------------------------------------------------
# @pytest.fixture(autouse=True)
# def bypass_jwt(monkeypatch):
#     # Bypass @jwt_required so routes don't 422
#     monkeypatch.setattr(payment, "jwt_required",
#                         lambda *a, **kw: (lambda fn: fn))
#     # Always return a fake user id
#     monkeypatch.setattr(payment, "get_jwt_identity", lambda: 1)

# # --------------------------------------------------------
# # Helpers
# # --------------------------------------------------------
# def create_admin_token():
#     return "fake-admin-token"


# def create_user_token():
#     return "fake-user-token"


# @pytest.fixture
# def auth_headers():
#     return {"Authorization": f"Bearer {create_admin_token()}"}


# @pytest.fixture
# def user_headers():
#     return {"Authorization": f"Bearer {create_user_token()}"}

# # --------------------------------------------------------
# # Tests
# # --------------------------------------------------------

# def test_get_payments_empty(client, monkeypatch, auth_headers):
#     """GET /payments should return empty list if no data exists"""
#     monkeypatch.setattr(
#         "routes.payment.Payment.query.order_by",
#         lambda *a, **kw: []
#     )

#     resp = client.get("/api/payments", headers=auth_headers)
#     body = resp.get_json()

#     assert resp.status_code == 200
#     assert body["status"] == "success"
#     assert body["data"] == []


# def test_post_payment_with_cash(client, monkeypatch, auth_headers):
#     """POST /payments should create payment when invoice + cash tx are stubbed"""

#     class FakeInvoice:
#         id = 1
#         amount = 1000
#         payments = []
#         status = None

#     monkeypatch.setattr(
#         "routes.payment.Invoice.query.get",
#         lambda _id: FakeInvoice()
#     )
#     monkeypatch.setattr(
#         "routes.payment.CashTransaction.query.get",
#         lambda _id: object()
#     )

#     resp = client.post(
#         "/api/payments",
#         json={
#             "invoice_id": 1,
#             "payment_method": "cash",
#             "payment_method_id": 1,
#         },
#         headers=auth_headers,
#     )
#     body = resp.get_json()

#     assert resp.status_code == 201
#     assert body["status"] == "success"
#     assert "data" in body


# def test_get_payment_not_found(client, monkeypatch, auth_headers):
#     """GET /payments/<id> returns 404 if payment missing"""
#     monkeypatch.setattr(
#         "routes.payment.Payment.query.get",
#         lambda _id: None
#     )

#     resp = client.get("/api/payments/99", headers=auth_headers)
#     body = resp.get_json()

#     assert resp.status_code == 404
#     assert body["status"] == "error"


# def test_delete_payment_success(client, monkeypatch, auth_headers):
#     """DELETE /payments/<id> removes a payment if it exists"""

#     class FakePayment:
#         id = 1
#         def to_dict(self):
#             return {"id": 1}

#     monkeypatch.setattr(
#         "routes.payment.Payment.query.get",
#         lambda _id: FakePayment()
#     )
#     monkeypatch.setattr(
#         "routes.payment.db.session.delete",
#         lambda obj: None
#     )
#     monkeypatch.setattr(
#         "routes.payment.db.session.commit",
#         lambda : None
#     )

#     resp = client.delete("/api/payments/1", headers=auth_headers)
#     body = resp.get_json()

#     assert resp.status_code == 200
#     assert body["status"] == "success"
#     assert body["message"] == "Payment deleted successfully"


# def test_forbidden_access(client, monkeypatch, user_headers):
#     """Non-admin user should not be able to hit endpoints"""
#     monkeypatch.setattr(
#         "routes.payment.require_admin",
#         lambda : False
#     )

#     resp = client.get("/api/payments", headers=user_headers)
#     assert resp.status_code == 403
