from flask_restful import Resource, Api
from flask import Blueprint
from models import Blog

# Create a Blueprint
blogs_bp = Blueprint("blogs", __name__, url_prefix="/api/blogs")
api = Api(blogs_bp)


# --- Resource for all blogs ---
class BlogListResource(Resource):
    def get(self):
        blogs = Blog.query.order_by(Blog.date_created.desc()).all()
        blog_list = [
            {
                "id": blog.id,
                "title": blog.title,
                "author_name": blog.author_name,
                "date_created": blog.date_created.isoformat(),
                "image": blog.image,
                "category": blog.category,
                "reading_duration": blog.reading_duration,
                "preview": (
                    blog.content[:100] + "..."
                    if len(blog.content) > 100
                    else blog.content
                ),
            }
            for blog in blogs
        ]
        return {
            "status": "success",
            "message": "Blogs fetched successfully",
            "data": blog_list,
        }, 200


# --- Resource for a single blog ---
class BlogResource(Resource):
    def get(self, blog_id):
        blog = Blog.query.get_or_404(blog_id)
        return {
            "status": "success",
            "message": "Blog fetched successfully",
            "data": blog.to_dict(),
        }, 200


# Add resources to the API
api.add_resource(BlogListResource, "/")
api.add_resource(BlogResource, "/<int:blog_id>")
