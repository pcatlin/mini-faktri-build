from app import create_app


def test_validate_endpoint_returns_errors(tmp_path) -> None:
    app = create_app({"TESTING": True, "DATABASE_PATH": str(tmp_path / "test.db")})
    client = app.test_client()

    response = client.post(
        "/api/validate",
        json={"resources": [{"type": "cpu", "count": 2}], "services": []},
    )
    assert response.status_code == 400
    payload = response.get_json()
    assert payload["valid"] is False
    assert payload["errors"][0]["code"]


def test_validate_requires_minimum_resources(tmp_path) -> None:
    app = create_app({"TESTING": True, "DATABASE_PATH": str(tmp_path / "test.db")})
    client = app.test_client()

    response = client.post(
        "/api/validate",
        json={"resources": [{"type": "cpu", "count": 1}], "services": []},
    )
    assert response.status_code == 400
    payload = response.get_json()
    error_codes = {error["code"] for error in payload["errors"]}
    assert "missing_minimum_memory" in error_codes
    assert "missing_minimum_disk" in error_codes


def test_validate_accepts_required_resources(tmp_path) -> None:
    app = create_app({"TESTING": True, "DATABASE_PATH": str(tmp_path / "test.db")})
    client = app.test_client()

    response = client.post(
        "/api/validate",
        json={
            "resources": [
                {"type": "cpu", "count": 1},
                {"type": "memory"},
                {"type": "disk", "storageType": "ssd"},
            ],
            "services": [],
        },
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["valid"] is True
    assert payload["errors"] == []


def test_save_and_list_deployments(tmp_path) -> None:
    app = create_app({"TESTING": True, "DATABASE_PATH": str(tmp_path / "test.db")})
    client = app.test_client()

    save = client.post(
        "/api/deployments",
        json={
            "name": "draft-1",
            "status": "draft",
            "config": {"resources": [], "services": []},
        },
    )
    assert save.status_code == 201

    listed = client.get("/api/deployments")
    assert listed.status_code == 200
    items = listed.get_json()
    assert len(items) == 1
    assert items[0]["name"] == "draft-1"


def test_delete_deployment(tmp_path) -> None:
    app = create_app({"TESTING": True, "DATABASE_PATH": str(tmp_path / "test.db")})
    client = app.test_client()

    save = client.post(
        "/api/deployments",
        json={
            "name": "to-delete",
            "status": "draft",
            "config": {"resources": [], "services": []},
        },
    )
    assert save.status_code == 201
    deployment_id = save.get_json()["id"]

    delete_response = client.delete(f"/api/deployments/{deployment_id}")
    assert delete_response.status_code == 200
    assert delete_response.get_json()["deleted"] is True

    listed = client.get("/api/deployments")
    assert listed.status_code == 200
    items = listed.get_json()
    assert len(items) == 0
