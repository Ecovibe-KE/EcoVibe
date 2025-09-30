import io
import pytest
from flask_jwt_extended import create_access_token
from models import db
from models.user import User, Role, AccountStatus
from models.document import Document


# --------------------------------------------------------
# Fixtures
# --------------------------------------------------------


@pytest.fixture
def admin_user(session):
    user = User(
        full_name="Admin Tester",
        email="admin@test.com",
        phone_number="+254700000000",
        industry="Tech",
        role=Role.ADMIN,
        account_status=AccountStatus.ACTIVE,
    )
    user.set_password("Password123")
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def auth_header(admin_user):
    token = create_access_token(identity=str(admin_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def user_header(admin_user):
    # Reuse admin_user but monkeypatch require_admin for forbidden test
    token = create_access_token(identity=str(admin_user.id))
    return {"Authorization": f"Bearer {token}"}


# --------------------------------------------------------
# Core happy-path tests
# --------------------------------------------------------


def test_upload_document(client, session, auth_header, admin_user):
    file_data = io.BytesIO(b"dummy pdf content")
    file_data.name = "test.pdf"

    response = client.post(
        "/api/documents",
        data={
            "title": "Test Doc",
            "description": "Just testing",
            "admin_id": admin_user.id,
            "file": (file_data, "test.pdf"),
        },
        headers=auth_header,
        content_type="multipart/form-data",
    )

    body = response.get_json()
    assert response.status_code == 201
    assert body["status"] == "success"
    assert body["data"]["title"] == "Test Doc"

    doc = session.query(Document).first()
    assert doc.title == "Test Doc"


def test_get_documents(client, session, auth_header, admin_user):
    doc = Document(
        admin_id=admin_user.id,
        title="Seed Doc",
        description="seed desc",
        file_data=b"abc",
        filename="seed.pdf",
        mimetype="application/pdf",
    )
    session.add(doc)
    session.commit()

    response = client.get("/api/documents", headers=auth_header)
    body = response.get_json()

    assert response.status_code == 200
    assert body["status"] == "success"
    assert any(d["title"] == "Seed Doc" for d in body["data"])


def test_update_document(client, session, auth_header, admin_user):
    doc = Document(
        admin_id=admin_user.id,
        title="Old Title",
        description="Old Desc",
        file_data=b"123",
        filename="old.pdf",
        mimetype="application/pdf",
    )
    session.add(doc)
    session.commit()

    response = client.put(
        f"/api/documents/{doc.id}",
        data={"title": "New Title"},
        headers=auth_header,
        content_type="multipart/form-data",
    )

    body = response.get_json()
    assert response.status_code == 200
    assert body["data"]["title"] == "New Title"


def test_delete_document(client, session, auth_header, admin_user):
    doc = Document(
        admin_id=admin_user.id,
        title="Delete Me",
        description="to delete",
        file_data=b"xyz",
        filename="del.pdf",
        mimetype="application/pdf",
    )
    session.add(doc)
    session.commit()

    response = client.delete(f"/api/documents/{doc.id}", headers=auth_header)
    body = response.get_json()

    assert response.status_code == 200
    assert body["message"] == "Document deleted successfully"
    assert session.query(Document).get(doc.id) is None


def test_download_document(client, session, auth_header, admin_user):
    doc = Document(
        admin_id=admin_user.id,
        title="Download Me",
        description="for download",
        file_data=b"content here",
        filename="dl.pdf",
        mimetype="application/pdf",
    )
    session.add(doc)
    session.commit()

    response = client.get(f"/api/documents/{doc.id}/download", headers=auth_header)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert response.data.startswith(b"content")


# --------------------------------------------------------
# Edge cases
# --------------------------------------------------------


def test_get_document_not_found(client, auth_header):
    resp = client.get("/api/documents/999", headers=auth_header)
    body = resp.get_json()
    assert resp.status_code == 404
    assert body["status"] == "error"


def test_update_document_not_found(client, auth_header):
    resp = client.put(
        "/api/documents/12345",
        data={"title": "Won't Work"},
        headers=auth_header,
        content_type="multipart/form-data",
    )
    body = resp.get_json()
    assert resp.status_code == 404
    assert body["status"] == "error"


def test_delete_document_not_found(client, auth_header):
    resp = client.delete("/api/documents/54321", headers=auth_header)
    body = resp.get_json()
    assert resp.status_code == 404
    assert body["status"] == "error"


def test_forbidden_user_cannot_upload(client, user_header, monkeypatch, admin_user):
    # force require_admin to fail
    monkeypatch.setattr("routes.document.require_admin", lambda: False)

    file_data = io.BytesIO(b"fake data")
    file_data.name = "bad.pdf"

    resp = client.post(
        "/api/documents",
        data={
            "title": "Blocked Doc",
            "description": "user upload",
            "admin_id": admin_user.id,
            "file": (file_data, "bad.pdf"),
        },
        headers=user_header,
        content_type="multipart/form-data",
    )
    assert resp.status_code == 403


@pytest.mark.xfail(reason="API currently accepts all file types")
def test_upload_invalid_file_type(client, auth_header, admin_user):
    bad_file = io.BytesIO(b"junk data")
    bad_file.name = "bad.txt"

    resp = client.post(
        "/api/documents",
        data={
            "title": "Bad File",
            "description": "not pdf",
            "admin_id": admin_user.id,
            "file": (bad_file, "bad.txt"),
        },
        headers=auth_header,
        content_type="multipart/form-data",
    )
    assert resp.status_code == 400


def test_internal_error_on_commit(client, auth_header, admin_user, monkeypatch):
    file_data = io.BytesIO(b"dummy")
    file_data.name = "fail.pdf"

    def bad_commit():
        raise Exception("DB failed")

    monkeypatch.setattr(db.session, "commit", bad_commit)

    resp = client.post(
        "/api/documents",
        data={
            "title": "Break DB",
            "description": "simulate fail",
            "admin_id": admin_user.id,
            "file": (file_data, "fail.pdf"),
        },
        headers=auth_header,
        content_type="multipart/form-data",
    )

    body = resp.get_json()
    assert resp.status_code == 500
    assert body["status"] == "error"
