import io
import pytest
from flask_jwt_extended import create_access_token
from models import db
from models.user import User, Role, AccountStatus
from models.document import Document


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

    # Check in DB
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
