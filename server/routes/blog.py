from flask_restful import Resource, Api
from flask import Blueprint
from models import Blog

# Create a Blueprint
blogs_bp = Blueprint("blogs", __name__, url_prefix="/blogs")
api = Api(blogs_bp)


# --- Resource for all blogs ---
class BlogListResource(Resource):
    def get(self):
        blogs = Blog.query.order_by(Blog.date_created.desc()).all()
        blog_list = []
        for blog in blogs:
            content = str(blog.content or "")  # normalize None to ""
            preview = content[:100] + "..." if len(content) > 100 else content

            blog_list.append(
                {
                    "id": blog.id,
                    "title": blog.title,
                    "author_name": blog.author_name,
                    "date_created": blog.date_created.isoformat(),
                    "image": blog.image,
                    "category": blog.category,
                    "reading_duration": blog.reading_duration,
                    "preview": preview,
                }
            )

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


# Add resources to the API
api.add_resource(BlogListResource, "/")
api.add_resource(BlogResource, "/<int:blog_id>")
