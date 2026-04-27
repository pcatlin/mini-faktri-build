from flask import Flask
from flask_cors import CORS

from .db.repository import DeploymentRepository
from .routes import register_routes


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE_PATH="data/mini_faktri.db",
    )
    if test_config:
        app.config.update(test_config)

    CORS(app)
    app.extensions["repo"] = DeploymentRepository(app.config["DATABASE_PATH"])
    register_routes(app)
    return app
