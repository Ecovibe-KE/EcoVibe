from flask import Blueprint, request, jsonify, send_file
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from io import BytesIO
from datetime import datetime, timezone

from models import db
from models.user import User, Role
from models.document import Document

document_bp = Blueprint("documents", __name__)
api = Api(document_bp)


# --- Helpers ---
def require_admin():
    uid = int(get_jwt_identity())
    user = User.query.get(uid)
    return user and user.role in [Role.ADMIN, Role.SUPER_ADMIN]


def error(message, code=400):
    return {"status": "error", "message": message, "data": None}, code


# --- Resources ---
class DocumentListResource(Resource):
    @jwt_required()
    def get(self):
        if not require_admin():
            return error("Forbidden: You do not have permission to perform this action.", 403)
        docs = Document.query.order_by(Document.created_at.desc()).all()
        return {
            "status": "success",
            "message": "Documents retrieved successfully",
            "data": [d.to_dict() for d in docs],
        }, 200

    @jwt_required()
    def post(self):
        if not require_admin():
            return error("Forbidden: You do not have permission to perform this action.", 403)

        file = request.files.get("file")
        title = request.form.get("title")
        description = request.form.get("description")
        admin_id = request.form.get("admin_id", type=int)

        if not file or not title or not description or not admin_id:
            return error("Invalid input provided", 400)

        try:
            new_doc = Document(
                admin_id=admin_id,
                title=title,
                description=description,
                file_data=file.read(),
                filename=file.filename,
                mimetype=file.mimetype,
                created_at=datetime.now(timezone.utc),
            )
            db.session.add(new_doc)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("An unexpected error occurred", 500)

        return {
            "status": "success",
            "message": "Document uploaded successfully",
            "data": new_doc.to_dict(),
        }, 201


class DocumentResource(Resource):
    @jwt_required()
    def get(self, doc_id):
        if not require_admin():
            return error("Forbidden: You do not have permission to perform this action.", 403)
        doc = Document.query.get(doc_id)
        if not doc:
            return error("Resource not found", 404)
        return {
            "status": "success",
            "message": "Document retrieved successfully",
            "data": doc.to_dict(),
        }, 200

    @jwt_required()
    def put(self, doc_id):
        if not require_admin():
            return error("Forbidden: You do not have permission to perform this action.", 403)
        doc = Document.query.get(doc_id)
        if not doc:
            return error("Resource not found", 404)

        title = request.form.get("title")
        description = request.form.get("description")
        file = request.files.get("file")

        if title:
            doc.title = title
        if description:
            doc.description = description
        if file:
            doc.file_data = file.read()
            doc.filename = file.filename
            doc.mimetype = file.mimetype

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("An unexpected error occurred", 500)

        return {
            "status": "success",
            "message": "Document updated successfully",
            "data": doc.to_dict(),
        }, 200

    @jwt_required()
    def delete(self, doc_id):
        if not require_admin():
            return error("Forbidden: You do not have permission to perform this action.", 403)
        doc = Document.query.get(doc_id)
        if not doc:
            return error("Resource not found", 404)

        try:
            db.session.delete(doc)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("An unexpected error occurred", 500)

        return {
            "status": "success",
            "message": "Document deleted successfully",
            "data": None,
        }, 200


class DocumentDownloadResource(Resource):
    @jwt_required()
    def get(self, doc_id):
        if not require_admin():
            return error("Forbidden: You do not have permission to perform this action.", 403)
        doc = Document.query.get(doc_id)
        if not doc:
            return error("Resource not found", 404)

        return send_file(
            BytesIO(doc.file_data),
            mimetype=doc.mimetype,
            as_attachment=True,
            download_name=doc.filename,
        )


# --- Register routes ---
api.add_resource(DocumentListResource, "/documents")
api.add_resource(DocumentResource, "/documents/<int:doc_id>")
api.add_resource(DocumentDownloadResource, "/documents/<int:doc_id>/download")
