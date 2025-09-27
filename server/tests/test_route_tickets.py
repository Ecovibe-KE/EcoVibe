import pytest
from flask_jwt_extended import create_access_token
from app import create_app, db
from models.user import User, Role
from models.ticket import Ticket
from models.ticket_message import TicketMessage


@pytest.fixture
def client():
	app = create_app("testing")
	with app.test_client() as client:
		with app.app_context():
			db.create_all()
			yield client
			db.session.remove()
			db.drop_all()

@pytest.fixture
def auth_headers(client):
	# Create a sample client user
	user = User(full_name="Test Client", email="client@test.com", role=Role.CLIENT)
	db.session.add(user)
	db.session.commit()
	token = create_access_token(identity=user.id)
	return {"Authorization": f"Bearer {token}"}, user

def test_create_ticket(client, auth_headers):
	headers, _ = auth_headers
	resp = client.post("/tickets", json={
		"subject": "Test Subject",
		"description": "This is a test ticket"
	}, headers=headers)

	assert resp.status_code == 201
	data = resp.get_json()
	assert data["status"] == "success"
	assert data["data"]["subject"] == "Test Subject"

def test_get_ticket_list(client, auth_headers):
	headers, user = auth_headers
	# Create one ticket manually
	ticket = Ticket(client_id=user.id, subject="Existing Ticket")
	db.session.add(ticket)
	db.session.commit()

	resp = client.get("/tickets", headers=headers)
	assert resp.status_code == 200
	data = resp.get_json()
	assert "tickets" in data["data"]
	assert len(data["data"]["tickets"]) >= 1
