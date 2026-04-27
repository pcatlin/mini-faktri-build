from dataclasses import dataclass
from typing import Any

from .constants import RESOURCE_TYPES, SERVICE_DEPENDENCIES, SOFTWARE_CATEGORIES


@dataclass
class ValidationIssue:
    code: str
    path: str
    message: str

    def as_dict(self) -> dict[str, str]:
        return {"code": self.code, "path": self.path, "message": self.message}


def validate_deployment_config(payload: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    resources = payload.get("resources", [])
    services = payload.get("services", [])

    if not isinstance(resources, list):
        return [ValidationIssue("invalid_type", "resources", "Resources must be a list.")]
    if not isinstance(services, list):
        return [ValidationIssue("invalid_type", "services", "Services must be a list.")]

    cpu_count = 0
    memory_count = 0
    disk_count = 0
    storage_kinds: set[str] = set()
    for index, resource in enumerate(resources):
        path = f"resources[{index}]"
        if not isinstance(resource, dict):
            issues.append(ValidationIssue("invalid_resource", path, "Resource must be an object."))
            continue

        r_type = resource.get("type")
        if r_type not in RESOURCE_TYPES:
            issues.append(
                ValidationIssue(
                    "unknown_resource_type",
                    f"{path}.type",
                    f"Resource type must be one of: {', '.join(sorted(RESOURCE_TYPES))}.",
                )
            )
            continue

        if r_type == "cpu":
            cpu_count += int(resource.get("count", 1))
        if r_type == "memory":
            memory_count += 1
        if r_type == "disk":
            disk_count += 1
            storage_kind = resource.get("storageType")
            if storage_kind:
                storage_kinds.add(str(storage_kind))

    if cpu_count < 1:
        issues.append(
            ValidationIssue("missing_minimum_cpu", "resources", "Deployment requires at least 1 CPU.")
        )

    if memory_count < 1:
        issues.append(
            ValidationIssue(
                "missing_minimum_memory",
                "resources",
                "Deployment requires at least 1 memory resource.",
            )
        )

    if disk_count < 1:
        issues.append(
            ValidationIssue("missing_minimum_disk", "resources", "Deployment requires at least 1 disk.")
        )

    if cpu_count > 1:
        issues.append(
            ValidationIssue("cpu_limit_exceeded", "resources", "CPU count cannot exceed 1 total.")
        )

    if len(storage_kinds) > 1:
        issues.append(
            ValidationIssue(
                "mixed_storage_types",
                "resources",
                "Cannot mix storage types in one deployment.",
            )
        )

    categories_present: set[str] = set()
    for index, service in enumerate(services):
        path = f"services[{index}]"
        if not isinstance(service, dict):
            issues.append(ValidationIssue("invalid_service", path, "Service must be an object."))
            continue

        category = service.get("category")
        if category not in SOFTWARE_CATEGORIES:
            issues.append(
                ValidationIssue(
                    "unknown_service_category",
                    f"{path}.category",
                    f"Service category must be one of: {', '.join(sorted(SOFTWARE_CATEGORIES))}.",
                )
            )
            continue
        categories_present.add(category)

    for service_name, dependency_set in SERVICE_DEPENDENCIES.items():
        if service_name in categories_present:
            missing = dependency_set.difference(categories_present)
            for missing_dep in sorted(missing):
                issues.append(
                    ValidationIssue(
                        "missing_dependency",
                        "services",
                        f"{service_name} requires {missing_dep} to be included.",
                    )
                )

    return issues
