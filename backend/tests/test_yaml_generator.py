from app.services.yaml_generator import generate_deployment_yaml


def test_yaml_generation_is_deterministic() -> None:
    payload = {
        "name": "alpha",
        "resources": [{"id": "2", "type": "memory"}, {"id": "1", "type": "cpu"}],
        "services": [
            {"name": "Comms", "category": "comms"},
            {"name": "AtlasDB", "category": "db"},
        ],
    }
    rendered = generate_deployment_yaml(payload)
    assert "name: alpha" in rendered
    assert rendered.index("type: cpu") < rendered.index("type: memory")
