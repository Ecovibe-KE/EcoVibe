from flask_restful import Api
from .user import RegisterResource

def register_routes(app):
    api = Api(app)

    api.add_resource(RegisterResource, "/register")
