SOFTWARE_CATEGORIES = {
    "os",
    "db",
    "comms",
    "mapping",
    "drone_control_center",
    "vpn",
    "other_defense",
}

RESOURCE_TYPES = {"cpu", "memory", "disk", "gpu"}

SERVICE_DEPENDENCIES = {
    "drone_control_center": {"db"},
}
