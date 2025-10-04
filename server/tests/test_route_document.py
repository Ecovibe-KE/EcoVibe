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
#     user = User(
#         email="admin@test.com",
#         role=Role.ADMIN,
#         password="hashed1234",  # ✅ fixed password length
#     )
#     db.session.add(user)
#     db.session.commit()
#     return user


# @pytest.fixture
# def client_user(app):
#     user = User(
#         email="client@test.com",
#         role=Role.CLIENT,
#         password="hashed1234",  # ✅ fixed password length
#     )
#     db.session.add(user)
#     db.session.commit()
#     return user


# # -----------------------
# # Tests
# # -----------------------
# def test_get_documents_empty(client, admin_user, auth_headers):
#     """Should return an empty list if no documents exist."""
#     response = client.get(
#         "/api/documents",
#         headers=auth_headers(admin_user),
#     )
#     assert response.status_code == 200
#     assert response.json["data"] == []


# def test_post_document_success(client, admin_user, auth_headers):
#     """Admin should be able to upload a document."""
#     data = {
#         "title": "Report Q1",
#         "description": "Quarterly report",
#         "file": (io.BytesIO(b"dummy content"), "report.pdf"),
#     }
#     response = client.post(
#         "/api/documents",
#         data=data,
#         headers=auth_headers(admin_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 201
#     assert response.json["status"] == "success"
#     assert response.json["data"]["title"] == "Report Q1"


# def test_post_document_forbidden_for_client(client, client_user, auth_headers):
#     """Client should NOT be able to upload a document."""
#     data = {
#         "title": "Hacker Try",
#         "description": "Client trying to upload",
#         "file": (io.BytesIO(b"bad content"), "hack.pdf"),
#     }
#     response = client.post(
#         "/api/documents",
#         data=data,
#         headers=auth_headers(client_user),
#         content_type="multipart/form-data",
#     )
#     assert response.status_code == 403


# def test_get_document_by_id(client, admin_user, auth_headers):
#     """Admin should be able to fetch a document by id."""
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Doc Title",
#         description="Test description",
#         filename="test.pdf",
#         mimetype="application/pdf",
#         file_data=b"PDFDATA",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.get(
#         f"/api/documents/{doc.id}",
#         headers=auth_headers(admin_user),
#     )
#     assert response.status_code == 200
#     assert response.json["data"]["title"] == "Doc Title"


# def test_put_document_update_title(client, admin_user, auth_headers):
#     """Admin should be able to update a document title."""
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Old Title",
#         description="Desc",
#         filename="old.pdf",
#         mimetype="application/pdf",
#         file_data=b"DATA",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.put(
#         f"/api/documents/{doc.id}",
#         json={"title": "New Title"},
#         headers=auth_headers(admin_user),
#     )
#     assert response.status_code == 200
#     assert response.json["data"]["title"] == "New Title"


# def test_delete_document_success(client, admin_user, auth_headers):
#     """Admin should be able to delete a document."""
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Delete Me",
#         description="Trash",
#         filename="del.pdf",
#         mimetype="application/pdf",
#         file_data=b"DATA",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.delete(
#         f"/api/documents/{doc.id}",
#         headers=auth_headers(admin_user),
#     )
#     assert response.status_code == 200
#     assert response.json["status"] == "success"


# def test_download_document(client, admin_user, auth_headers):
#     """Admin should be able to download a document."""
#     doc = Document(
#         admin_id=admin_user.id,
#         title="Download Me",
#         description="Testing download",
#         filename="dl.pdf",
#         mimetype="application/pdf",
#         file_data=b"DOWNLOADDATA",
#     )
#     db.session.add(doc)
#     db.session.commit()

#     response = client.get(
#         f"/api/documents/{doc.id}/download",
#         headers=auth_headers(admin_user),
#     )
#     assert response.status_code == 200
#     assert response.headers["Content-Type"] == "application/pdf"
#     assert response.data == b"DOWNLOADDATA"
