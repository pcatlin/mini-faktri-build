from app.domain.validation import validate_deployment_config


def test_cpu_limit_exceeded_error() -> None:
    payload = {
        "resources": [{"type": "cpu", "count": 2}],
        "services": [],
    }
    issues = validate_deployment_config(payload)
    assert any(i.code == "cpu_limit_exceeded" for i in issues)


def test_storage_mix_error() -> None:
    payload = {
        "resources": [
            {"type": "disk", "storageType": "ssd"},
            {"type": "disk", "storageType": "hdd"},
        ],
        "services": [],
    }
    issues = validate_deployment_config(payload)
    assert any(i.code == "mixed_storage_types" for i in issues)


def test_drone_center_dependency_error() -> None:
    payload = {
        "resources": [],
        "services": [{"name": "Falcon Control", "category": "drone_control_center"}],
    }
    issues = validate_deployment_config(payload)
    assert any(i.code == "missing_dependency" for i in issues)
