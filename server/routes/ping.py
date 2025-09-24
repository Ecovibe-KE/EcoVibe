from flask import Blueprint, jsonify

# Create the blueprint
ping_bp = Blueprint("ping", __name__)


@ping_bp.route("/ping", methods=["GET"])
def ping():
    """
    Ping server to check if it is running.
    """
    return (
        jsonify(
            {
                "status": "success",
                "message": "The server is up and running.",
                "data": None,
            }
        ),
        200,
    )
