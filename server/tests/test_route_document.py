# TODO
# import io
# import pytest
# from models import db
# from models.user import User, Role
# from models.document import Document


# # -----------------------
# # Fixtures
# # -----------------------
# @pytest.fixture
# def admin_user(app):
#     """Create an admin user for tests"""
#     user = User(
#         email="admin@test.com",
#         role=Role.ADMIN,
#         password="Hashed1234",  # ✅ meets model validation
#     )
#     db.session.add(user)
#     db.session.commit()
#     return user


# @pytest.fixture
# def client_user(app):
#     """Create a client (non-admin) user for tests"""
#     user = User(
#         email="client@test.com",
#         role=Role.CLIENT,
#         password="Client1234",  # ✅ meets model validation
#     )
#     db.session.add(user)
#     db.session.commit()
#     return user


# # -----------------------
# # Helpers
# # -----------------------
# def make_file(
#     filename="test.pdf",
#     mimetype="application/pdf",
#     content=b"PDF-CONTENT",
# ):
#     return (io.BytesIO(content), filename)


# # -----------------------
# # Tests for POST /documents
# # -----------------------
# def test_admin_can_upload_document(client, admin_user, auth_headers):
#     data = {
#         "title": "Quarterly Report",
#         "description": "Q1 analysis",
#         "file": make_file(),
#     }
#     response = client.post(
#         "/api/documents",
#         data=data,
#         headers=auth_headers(admin_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 201
#     body = response.json
#     assert body["status"] == "success"
#     assert body["data"]["title"] == "Quarterly Report"
#     assert body["data"]["filename"] == "test.pdf"


# def test_client_cannot_upload_document(client, client_user, auth_headers):
#     data = {
#         "title": "Forbidden Upload",
#         "description": "Clients cannot upload",
#         "file": make_file(),
#     }
#     response = client.post(
#         "/api/documents",
#         data=data,
#         headers=auth_headers(client_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 403
#     assert response.json["message"].startswith("Forbidden")


# def test_upload_missing_fields(client, admin_user, auth_headers):
#     response = client.post(
#         "/api/documents",
#         data={"title": "Missing file"},
#         headers=auth_headers(admin_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 400
#     assert "Missing required fields" in response.json["message"]


# # -----------------------
# # Tests for GET /documents
# # -----------------------
# def test_get_documents_list(client, admin_user, auth_headers):
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Seed Doc",
#         description="seeded",
#         file_data=b"123",
#         filename="seed.pdf",
#         mimetype="application/pdf",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.get("/api/documents", headers=auth_headers(admin_user))
#     assert response.status_code == 200
#     assert response.json["status"] == "success"
#     assert any(d["filename"] == "seed.pdf" for d in response.json["data"])


# def test_get_single_document(client, admin_user, auth_headers):
#     doc = Document(
#         admin_id=admin_user.id,
#         title="My Doc",
#         description="desc",
#         file_data=b"DATA",
#         filename="mydoc.pdf",
#         mimetype="application/pdf",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.get(
#         f"/api/documents/{doc.id}", headers=auth_headers(admin_user)
#     )
#     assert response.status_code == 200
#     assert response.json["data"]["filename"] == "mydoc.pdf"


# def test_get_single_document_not_found(client, admin_user, auth_headers):
#     response = client.get(
#         "/api/documents/9999", headers=auth_headers(admin_user)
#     )
#     assert response.status_code == 404
#     assert "Resource not found" in response.json["message"]


# # -----------------------
# # Tests for PUT /documents
# # -----------------------
# def test_admin_can_update_document(client, admin_user, auth_headers):
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Old Title",
#         description="Old description",
#         file_data=b"DATA",
#         filename="old.pdf",
#         mimetype="application/pdf",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.put(
#         f"/api/documents/{doc.id}",
#         data={"title": "New Title"},
#         headers=auth_headers(admin_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 200
#     assert response.json["data"]["title"] == "New Title"


# def test_client_cannot_update_document(
#     client, admin_user, client_user, auth_headers
# ):
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Title",
#         description="Desc",
#         file_data=b"DATA",
#         filename="test.pdf",
#         mimetype="application/pdf",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.put(
#         f"/api/documents/{doc.id}",
#         data={"title": "Hacked"},
#         headers=auth_headers(client_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 403


# # -----------------------
# # Tests for DELETE /documents
# # -----------------------
# def test_admin_can_delete_document(client, admin_user, auth_headers):
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Delete Me",
#         description="Bye",
#         file_data=b"DATA",
#         filename="delete.pdf",
#         mimetype="application/pdf",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.delete(
#         f"/api/documents/{doc.id}", headers=auth_headers(admin_user)
#     )
#     assert response.status_code == 200
#     assert response.json["message"] == "Document deleted successfully"


# def test_delete_document_not_found(client, admin_user, auth_headers):
#     response = client.delete(
#         "/api/documents/9999", headers=auth_headers(admin_user)
#     )
#     assert response.status_code == 404


# # -----------------------
# # Tests for Download
# # -----------------------
# def test_download_document(client, admin_user, auth_headers):
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Download Me",
#         description="File download",
#         file_data=b"HELLO",
#         filename="hello.pdf",
#         mimetype="application/pdf",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.get(
#         f"/api/documents/{doc.id}/download", headers=auth_headers(admin_user)
#     )
#     assert response.status_code == 200
#     assert response.data == b"HELLO"
#     assert response.mimetype == "application/pdf"
