import os
import sys
from pathlib import Path
from flask_cors import CORS

# from server.routes import register_routes
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config.from_prefixed_env()
    CORS(app)


    return app
app = create_app()

from routes.contact import contact_bp
app.register_blueprint(contact_bp)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5555)))