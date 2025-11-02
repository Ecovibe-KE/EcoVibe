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

# --- Config ---
ALLOWED_MIME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# --- Helpers ---
def get_current_user():
    """Return current user instance from JWT"""
    uid = int(get_jwt_identity())
    return User.query.get(uid)


def error(message, code=400):
    return {"status": "error", "message": message, "data": None}, code


def validate_file(file):
    """Check file type and size"""
    if file.mimetype not in ALLOWED_MIME:
        raise ValueError("Unsupported file type")
    file.seek(0, 2)  # move pointer to end
    size = file.tell()
    if size > MAX_FILE_SIZE:
        raise ValueError("File too large (max 10 MB)")
    file.seek(0)  # reset pointer


# --- Resources ---
class DocumentListResource(Resource):
    @jwt_required()
    def get(self):
        user = get_current_user()
        if not user:
            return error("User not found", 404)

        # Pagination params
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        # Filtering params
        search = request.args.get("search", "", type=str)
        file_type = request.args.get("type", "", type=str)

        query = Document.query

        if search:
            query = query.filter(Document.title.ilike(f"%{search}%"))
        if file_type:
            query = query.filter(Document.mimetype == file_type)

        query = query.order_by(Document.created_at.desc())

        docs = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "status": "success",
            "message": "Documents retrieved successfully",
            "data": [d.to_dict() for d in docs.items],
            "pagination": {
                "page": docs.page,
                "pages": docs.pages,
                "total": docs.total,
                "per_page": docs.per_page,
            },
        }, 200

    @jwt_required()
    def post(self):
        user = get_current_user()
        if not user or user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )

        file = request.files.get("file")
        title = request.form.get("title")
        description = request.form.get("description")

        if not file or not title or not description:
            return error("Missing required fields: title, description, file", 400)

        try:
            # File validation
            validate_file(file)

            new_doc = Document(
                admin_id=user.id,
                title=title,
                description=description,
                file_data=file.read(),
                filename=file.filename,
                mimetype=file.mimetype,
                created_at=datetime.now(timezone.utc),
            )
            db.session.add(new_doc)
            db.session.commit()
        except ValueError as e:
            return error(str(e), 400)
        except Exception as e:
            db.session.rollback()
            return error(f"Unexpected error while uploading document: {e}", 500)

        return {
            "status": "success",
            "message": "Document uploaded successfully",
            "data": new_doc.to_dict(),
        }, 201


class DocumentResource(Resource):
    @jwt_required()
    def get(self, doc_id):
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
        user = get_current_user()
        if not user or user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )

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
            try:
                validate_file(file)
                doc.file_data = file.read()
                doc.filename = file.filename
                doc.mimetype = file.mimetype
            except ValueError as e:
                return error(str(e), 400)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("Unexpected error while updating document", 500)

        return {
            "status": "success",
            "message": "Document updated successfully",
            "data": doc.to_dict(),
        }, 200

    @jwt_required()
    def delete(self, doc_id):
        user = get_current_user()
        if not user or user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            return error(
                "Forbidden: You do not have permission to perform this action.", 403
            )

        doc = Document.query.get(doc_id)
        if not doc:
            return error("Resource not found", 404)

        try:
            db.session.delete(doc)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return error("Unexpected error while deleting document", 500)

        return {
            "status": "success",
            "message": "Document deleted successfully",
            "data": None,
        }, 200


class DocumentDownloadResource(Resource):
    @jwt_required()
    def get(self, doc_id):
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
