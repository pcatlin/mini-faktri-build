export type ResourceType = "cpu" | "memory" | "disk" | "gpu";

export type ServiceCategory =
  | "os"
  | "db"
  | "comms"
  | "mapping"
  | "drone_control_center"
  | "vpn"
  | "other_defense";

export interface ResourceItem {
  id: string;
  type: ResourceType;
  count?: number;
  storageType?: "ssd" | "hdd" | "nvme";
}

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
}

export interface DeploymentConfig {
  name: string;
  resources: ResourceItem[];
  services: ServiceItem[];
}

export interface ValidationError {
  code: string;
  path: string;
  message: string;
}
