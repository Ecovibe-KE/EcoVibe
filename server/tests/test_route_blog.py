import pytest
from models.blog import Blog
from models.user import User  # make sure to import your User model


@pytest.fixture
def test_blogs(session):
    # Create a test admin user
    admin = User(username="admin", email="admin@example.com", password="hashedpassword")
    session.add(admin)
    session.commit()  # commit to get the ID

    # Now create blogs with the correct admin_id
    blog1 = Blog(
        title="Test Blog 1",
        author_name="Alice",
        content="Content 1",
        image="image1.jpg",
        category="Tutorial",
        reading_duration="5 min",
        admin_id=admin.id,
    )
    blog2 = Blog(
        title="Test Blog 2",
        author_name="Bob",
        content="Content 2",
        image="image2.jpg",
        category="News",
        reading_duration="3 min",
        admin_id=admin.id,
    )
    session.add_all([blog1, blog2])
    session.commit()
    return blog1, blog2
