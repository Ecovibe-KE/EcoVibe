import base64
import logging
import re

from datetime import datetime
from io import BytesIO

from flask import Blueprint, request, send_file
from flask_restful import Api, Resource

from models.partnerships_n_funding import (
    partmenership_n_funding,
    partnershipType,
    partnershipStatus,
)

from models import db


logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s"
)

logger = logging.getLogger(__name__)


# Create the blueprint
partnership_bp = Blueprint("partnership", __name__)

api = Api(partnership_bp)


class PartnershipListResource(Resource):

    def get(self):
        """Get all published partnerships and funding opportunities"""

        try:
            partnerships = partmenership_n_funding.query.filter_by(
                status=partnershipStatus.published
            ).all()

            return {
                "message": "Partnerships retrieved successfully",
                "data": [partnership.to_dict() for partnership in partnerships],
            }, 200

        except Exception as e:

            logger.error(f"Error retrieving partnerships: {str(e)}")

            return {"error": "Internal server error"}, 500

    def post(self):
        """Create a new partnership or funding opportunity"""

        try:
            data = request.get_json() or {}

            if not data:
                return {"error": "No data provided"}, 400

            required_fields = [
                "title",
                "type",
                "description",
                "image",
                "launch_date",
                "deadline_date",
            ]

            missing_fields = [
                field
                for field in required_fields
                if field not in data
                or data[field] is None
                or (isinstance(data[field], str) and not data[field].strip())
            ]

            if missing_fields:
                return {
                    "error": (
                        f"Missing required fields: " f"{', '.join(missing_fields)}"
                    )
                }, 400

            title = sanitize_input(data["title"])
            description = sanitize_input(data["description"])
            type_value = sanitize_input(data["type"])

            if not title:
                return {"error": "Title cannot be empty"}, 400

            if not description:
                return {"error": "Description cannot be empty"}, 400

            if len(title) > 255:
                return {"error": "Title too long"}, 400

            # Validate type
            try:
                partnership_type = partnershipType(type_value)

            except ValueError:
                return {
                    "error": "Invalid partnership type",
                    "allowed_types": ["Funding", "Partnership"],
                }, 400

            # Parse dates
            try:
                launch_date = parse_date(data["launch_date"])

                deadline_date = parse_date(data["deadline_date"])

            except ValueError:
                return {"error": "Invalid date format"}, 400

            # Validate timeline
            if launch_date > deadline_date:
                return {"error": ("Launch date cannot be after " "deadline date")}, 400

            try:
                image_data, image_content_type = parse_image(data["image"])

            except ValueError as e:
                return {"error": str(e)}, 400

            partnership = partmenership_n_funding(
                title=title,
                type=partnership_type,
                description=description,
                image=image_data,
                image_content_type=image_content_type,
                launch_date=launch_date,
                deadline_date=deadline_date,
                status=partnershipStatus.draft,
            )

            db.session.add(partnership)
            db.session.commit()

            return {
                "message": "Partnership created successfully",
                "data": partnership.to_dict(),
            }, 201

        except Exception as e:

            db.session.rollback()

            logger.error(f"Error creating partnership: {str(e)}")

            return {"error": "Internal server error"}, 500


class PartnershipResource(Resource):

    def get(self, partnership_id):
        """Get a single published partnership"""

        try:
            partnership = db.session.get(partmenership_n_funding, partnership_id)

            if not partnership:
                return {"error": "Partnership not found"}, 404

            if partnership.status != partnershipStatus.published:
                return {"error": "Partnership not found"}, 404

            return {
                "message": "Partnership retrieved successfully",
                "data": partnership.to_dict(),
            }, 200

        except Exception as e:

            logger.error(f"Error retrieving partnership " f"{partnership_id}: {str(e)}")

            return {"error": "Internal server error"}, 500

    def put(self, partnership_id):
        """Update a partnership"""

        try:
            partnership = db.session.get(partmenership_n_funding, partnership_id)

            if not partnership:
                return {"error": "Partnership not found"}, 404

            data = request.get_json() or {}

            if not data:
                return {"error": "No data provided"}, 400

            if "title" in data:

                title = sanitize_input(data["title"])

                if not title:
                    return {"error": "Title cannot be empty"}, 400

                if len(title) > 255:
                    return {"error": "Title too long"}, 400

                partnership.title = title

            if "type" in data:

                type_value = sanitize_input(data["type"])

                try:
                    partnership.type = partnershipType(type_value)

                except ValueError:
                    return {
                        "error": "Invalid partnership type",
                        "allowed_types": ["Funding", "Partnership"],
                    }, 400

            if "description" in data:

                description = sanitize_input(data["description"])

                if not description:
                    return {"error": "Description cannot be empty"}, 400

                partnership.description = description

            if "launch_date" in data:

                try:
                    partnership.launch_date = parse_date(data["launch_date"])

                except ValueError:
                    return {"error": "Invalid launch date"}, 400

            if "deadline_date" in data:

                try:
                    partnership.deadline_date = parse_date(data["deadline_date"])

                except ValueError:
                    return {"error": "Invalid deadline date"}, 400

            if "image" in data and data["image"]:

                try:
                    image_data, image_content_type = parse_image(data["image"])

                except ValueError as e:
                    return {"error": str(e)}, 400

                partnership.image = image_data
                partnership.image_content_type = image_content_type

            if partnership.launch_date > partnership.deadline_date:
                return {"error": ("Launch date cannot be after " "deadline date")}, 400

            db.session.commit()

            return {
                "message": "Partnership updated successfully",
                "data": partnership.to_dict(),
            }, 200

        except Exception as e:

            db.session.rollback()

            logger.error(f"Error updating partnership " f"{partnership_id}: {str(e)}")

            return {"error": "Internal server error"}, 500

    def delete(self, partnership_id):
        """Delete a partnership"""

        try:
            partnership = db.session.get(partmenership_n_funding, partnership_id)

            if not partnership:
                return {"error": "Partnership not found"}, 404

            db.session.delete(partnership)
            db.session.commit()

            return {"message": "Partnership deleted successfully"}, 200

        except Exception as e:

            db.session.rollback()

            logger.error(f"Error deleting partnership " f"{partnership_id}: {str(e)}")

            return {"error": "Internal server error"}, 500


class PartnershipStatusResource(Resource):

    def patch(self, partnership_id):
        """Update partnership status"""

        try:
            partnership = db.session.get(partmenership_n_funding, partnership_id)

            if not partnership:
                return {"error": "Partnership not found"}, 404

            data = request.get_json() or {}

            if not data:
                return {"error": "No data provided"}, 400

            status_value = data.get("status")

            if status_value is None:
                return {"error": "Status is required"}, 400

            status_value = sanitize_input(status_value)

            try:
                status = partnershipStatus(status_value)

            except ValueError:
                return {
                    "error": "Invalid status",
                    "allowed_statuses": [
                        "Draft",
                        "Pending",
                        "Published",
                        "Rejected",
                        "Archived",
                    ],
                }, 400

            partnership.status = status

            db.session.commit()

            return {
                "message": ("Partnership status updated " "successfully"),
                "data": partnership.to_dict(),
            }, 200

        except Exception as e:

            db.session.rollback()

            logger.error(
                f"Error updating partnership status " f"{partnership_id}: {str(e)}"
            )

            return {"error": "Internal server error"}, 500


class PartnershipImageResource(Resource):

    def get(self, partnership_id):
        """Serve a partnership image"""

        try:
            partnership = db.session.get(partmenership_n_funding, partnership_id)

            if not partnership:
                return {"error": "Partnership not found"}, 404

            if not partnership.image:
                return {"error": "No image found for this partnership"}, 404

            return send_file(
                BytesIO(partnership.image),
                mimetype=(partnership.image_content_type or "image/jpeg"),
                as_attachment=False,
                download_name=(f"partnership_{partnership.id}_image"),
            )

        except Exception as e:

            logger.error(
                f"Error serving image for partnership " f"{partnership_id}: {str(e)}"
            )

            return {"error": "Internal server error"}, 500


def sanitize_input(value):
    """Sanitize string input"""

    if not isinstance(value, str):
        return ""

    return value.strip()


def parse_date(value):
    """Convert ISO date string to datetime"""

    if not isinstance(value, str) or not value.strip():
        raise ValueError("Invalid date")

    return datetime.fromisoformat(value)


MAX_IMAGE_SIZE = 5 * 1024 * 1024


def parse_image(value):
    """Decode a base64 image string into raw bytes."""

    if not isinstance(value, str) or not value.strip():
        raise ValueError("Image cannot be empty")

    content_type = "image/jpeg"

    if value.startswith("data:image/"):
        data_matches = re.match("^data:([^;]+);base64,", value)

        if not data_matches:
            raise ValueError("Invalid image format")

        content_type = data_matches.group(1)
        value = re.sub("^data:([^;]+);base64,", "", value)

    try:
        image_data = base64.b64decode(value)

    except (ValueError, TypeError):
        raise ValueError("Invalid image format. Must be valid base64")

    if not image_data:
        raise ValueError("Image cannot be empty")

    if len(image_data) > MAX_IMAGE_SIZE:
        raise ValueError("Image size must be less than 5MB")

    return image_data, content_type


# Register resources
api.add_resource(PartnershipListResource, "/partnerships")

api.add_resource(PartnershipImageResource, "/partnerships/image/<int:partnership_id>")

api.add_resource(PartnershipResource, "/partnerships/<int:partnership_id>")

api.add_resource(PartnershipStatusResource, "/partnerships/<int:partnership_id>/status")
