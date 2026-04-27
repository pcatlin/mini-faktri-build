from typing import Any

import yaml


def _resource_sort_key(resource: dict[str, Any]) -> tuple[str, str]:
    return (resource.get("type", ""), resource.get("id", ""))


def _service_sort_key(service: dict[str, Any]) -> tuple[str, str]:
    return (service.get("category", ""), service.get("name", ""))


def _normalize_payload(payload: dict[str, Any]) -> dict[str, Any]:
    name = payload.get("name", "unnamed-system")
    resources = payload.get("resources", [])
    services = payload.get("services", [])

    normalized_resources = sorted(resources, key=_resource_sort_key)
    normalized_services = sorted(services, key=_service_sort_key)

    return {
        "name": name,
        "resources": normalized_resources,
        "services": normalized_services,
    }


def generate_deployment_yaml(payload: dict[str, Any]) -> str:
    """Generate deterministic YAML output for valid payloads."""
    normalized = _normalize_payload(payload)
    return yaml.safe_dump(normalized, sort_keys=False)
