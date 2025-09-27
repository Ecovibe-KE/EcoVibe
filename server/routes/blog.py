from datetime import date
import os
from flask_restful import Resource, Api
from flask import Blueprint, request, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from utils.responses import restful_response
from models import db
from models.blog import Blog, BlogType
from models.user import User, Role
from models.newsletter_subscriber import NewsletterSubscriber
import threading
from utils import string_to_boolean
from io import BytesIO
from utils.mail_templates import send_newsletter_email


# Create a Blueprint
blogs_bp = Blueprint("blogs", __name__)
api = Api(blogs_bp)

client_host = os.getenv("FLASK_CLIENT_URL", "http://localhost:3000").rstrip("/")
server_host = os.getenv("FLASK_SERVER_URL", "http://localhost:5000").rstrip("/")


# --- Resource for all blogs ---
class BlogListResource(Resource):
    def get(self):
        blogs = Blog.query.order_by(Blog.date_created.desc()).all()
        blog_list = []
        for blog in blogs:
            blog_dict = blog.to_dict()
            content = str(blog_dict.get("content") or "")
            preview = content[:100] + "..." if len(content) > 100 else content
            blog_dict["preview"] = preview
            blog_list.append(blog_dict)

        return {
            "status": "success",
            "message": "Blogs fetched successfully",
            "data": blog_list,
        }, 200


# --- Resource for a single blog ---
class BlogResource(Resource):
    def get(self, blog_id):
        blog = Blog.query.get_or_404(blog_id)
        content = str(blog.content or "")
        blog_dict = blog.to_dict()
        blog_dict["content"] = content  # ensure content is normalized

        return {
            "status": "success",
            "message": "Blog fetched successfully",
            "data": blog_dict,
        }, 200


class BlogNewsletterResource(Resource):
    @jwt_required()
    def post(self):
        # Check if the post request has the file part
        if "image" not in request.files:
            return restful_response(
                status="error", message="No image file provided", status_code=400
            )

        file = request.files["image"]

        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == "":
            return restful_response(
                status="error", message="No selected file", status_code=400
            )

        # Extract and validate fields from form data
        title = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()

        if not title or not content:
            return restful_response(
                status="error",
                message="Title and content are required",
                status_code=400,
            )

        # Read the image data and get content type
        image_data = file.read()
        image_content_type = file.content_type

        # Additional optional fields from form
        type_ = request.form.get("type", BlogType.ARTICLE.value)

        categories_raw = request.form.get("category", "")
        categories = [
            c.strip() for c in categories_raw.split(",") if c.strip()
        ]  # comma-separated
        category_str = ",".join(categories)
        category = category_str or "general"

        # excerpt = request.form.get("excerpt", "").strip()
        draft = request.form.get("draft", "false")
        author_name = request.form.get("author_name", "EcoVibe Team").strip()
        reading_duration = request.form.get("reading_duration", "5 min read").strip()

        # Validate type
        if type_ not in [bt.value for bt in BlogType]:
            return restful_response(
                status="error",
                message="Invalid blog type",
                status_code=400,
            )

        draft = string_to_boolean(draft)

        try:

            if draft:
                pass  # Handle draft logic if needed

            admin_id = int(
                get_jwt_identity()
            )  # Assuming admin ID is the user ID from JWT
            admin = User.query.get(admin_id)
            if not admin or admin.role.value not in [
                Role.ADMIN.value,
                Role.SUPER_ADMIN.value,
            ]:
                return restful_response(
                    status="error", message="Unauthorized", status_code=403
                )

            author_name = admin.full_name if admin else author_name

            # Create a new blog instance
            new_blog = Blog(
                title=title,
                content=content,
                image=image_data,
                image_content_type=image_content_type,
                type=BlogType(type_),
                category=str(category),  # Store as string; adjust as needed
                author_name=author_name,
                reading_duration=reading_duration,
                admin_id=admin_id,
                # excerpt and draft are not in the model.
            )

            # Add to the session and commit
            db.session.add(new_blog)
            db.session.commit()

            # Send newsletter emails to subscribers
            if new_blog.type == BlogType.NEWSLETTER and not draft:
                threading.Thread(
                    target=self.send_newsletter,
                    args=(current_app._get_current_object(), new_blog),
                ).start()

            return restful_response(
                status="success",
                message="Blog created successfully",
                data=new_blog.to_dict(),
                status_code=201,
            )
        except ValueError as e:
            db.session.rollback()
            return restful_response(status="error", message=str(e), status_code=400)
        except Exception as e:
            db.session.rollback()
            # Log the exception for debugging
            print(f"An unexpected error occurred: {e}")
            return restful_response(
                status="error",
                message="An unexpected error occurred",
                status_code=500,
            )

    def send_newsletter(self, app, new_blog):
        with app.app_context():
            subscribers = NewsletterSubscriber.query.all()
            image_url = f"{server_host}/blogs/image/{new_blog.id}"
            blog_url = f"{client_host}/blogs/{new_blog.id}"
            current_year = date.today().year
            for subscriber in subscribers:
                # Send newsletter
                send_newsletter_email(
                    subscriber.email,
                    new_blog.title,
                    new_blog.content,
                    blog_url,
                    blog_url,
                    blog_url,
                    "Latest Newsletter from EcoVibe",
                    current_year,
                    image_url,
                )


class BlogImageResource(Resource):
    def get(self, blog_id):
        blog = Blog.query.get_or_404(blog_id)
        if not blog.image:
            return restful_response(
                status="error", message="No image found for this blog", status_code=404
            )

        return send_file(
            BytesIO(blog.image),
            mimetype=blog.image_content_type or "image/jpeg",
            as_attachment=False,
            download_name=f"blog_{blog.id}_image",
        )


# send blog resource
class SendNewsletterResource(Resource):
    @jwt_required()
    def post(self, blog_id):
        # enforce admin permissions
        try:
            admin_id = int(get_jwt_identity())
        except (TypeError, ValueError):
            return restful_response(
                status="error", message="Unauthorized", status_code=403
            )
        admin = User.query.get(admin_id)
        if not admin or admin.role.value not in [
            Role.ADMIN.value,
            Role.SUPER_ADMIN.value,
        ]:
            return restful_response(
                status="error", message="Unauthorized", status_code=403
            )

        # retrieve newsletter subscribers
        blog = Blog.query.get_or_404(blog_id)
        if blog.type != BlogType.NEWSLETTER:
            return restful_response(
                status="error", message="Blog is not a newsletter type", status_code=400
            )

        image_url = f"{server_host}/blogs/image/{blog.id}"
        blog_url = f"{client_host}/blogs/{blog.id}"
        current_year = date.today().year

        subscribers = NewsletterSubscriber.query.all()
        for subscriber in subscribers:
            # Send newsletter
            send_newsletter_email(
                subscriber.email,
                blog.title,
                blog.content,
                blog_url,
                blog_url,
                blog_url,
                "Latest Newsletter from EcoVibe",
                current_year,
                image_url,
            )
        return restful_response(
            status="success", message="Newsletter sent successfully", status_code=200
        )


api.add_resource(BlogListResource, "/blogs")
api.add_resource(BlogResource, "/blogs/<int:blog_id>")
api.add_resource(BlogNewsletterResource, "/blogs")
api.add_resource(BlogImageResource, "/blogs/image/<int:blog_id>")
api.add_resource(SendNewsletterResource, "/blogs/send-newsletter/<int:blog_id>")
