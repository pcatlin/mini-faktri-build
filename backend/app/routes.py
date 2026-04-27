from typing import Any

from flask import Flask, jsonify, render_template, request

from .domain.validation import validate_deployment_config
from .services.yaml_generator import generate_deployment_yaml


def register_routes(app: Flask) -> None:
    @app.get("/")
    def home() -> str:
        return render_template("index.html")

    @app.get("/health")
    def health() -> tuple[dict[str, str], int]:
        return {"status": "ok"}, 200

    @app.post("/api/validate")
    def validate() -> tuple[dict[str, Any], int]:
        payload = request.get_json(silent=True) or {}
        issues = validate_deployment_config(payload)
        if issues:
            return {"valid": False, "errors": [i.as_dict() for i in issues]}, 400
        return {"valid": True, "errors": []}, 200

    @app.post("/api/generate-yaml")
    def generate_yaml() -> tuple[dict[str, Any], int]:
        payload = request.get_json(silent=True) or {}
        issues = validate_deployment_config(payload)
        if issues:
            return {"valid": False, "errors": [i.as_dict() for i in issues]}, 400

        yaml_output = generate_deployment_yaml(payload)
        return {"valid": True, "yaml": yaml_output}, 200

    @app.post("/api/deployments")
    def save_deployment() -> tuple[dict[str, Any], int]:
        payload = request.get_json(silent=True) or {}
        status = payload.get("status", "draft")
        name = str(payload.get("name", "unnamed-system"))
        config = payload.get("config", {})

        if status == "built":
            issues = validate_deployment_config(config)
            if issues:
                return {"valid": False, "errors": [i.as_dict() for i in issues]}, 400
            yaml_text = generate_deployment_yaml(config)
        else:
            yaml_text = None

        repo = app.extensions["repo"]
        deployment_id = repo.save_deployment(name=name, status=status, payload=config, yaml_text=yaml_text)
        return {"id": deployment_id, "status": status, "yaml": yaml_text}, 201

    @app.get("/api/deployments")
    def list_deployments() -> Any:
        repo = app.extensions["repo"]
        return jsonify(repo.list_deployments())

    @app.delete("/api/deployments/<int:deployment_id>")
    def delete_deployment(deployment_id: int) -> tuple[dict[str, Any], int]:
        repo = app.extensions["repo"]
        deleted = repo.delete_deployment(deployment_id)
        if not deleted:
            return {"deleted": False, "error": "Deployment not found."}, 404
        return {"deleted": True}, 200
