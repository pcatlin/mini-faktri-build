import type { DeploymentConfig, ValidationError } from "./types/deployment";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function validateConfig(config: DeploymentConfig): Promise<ValidationError[]> {
  const response = await fetch(`${API_BASE}/api/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  const payload = await response.json();
  return payload.errors ?? [];
}

export async function generateYaml(config: DeploymentConfig): Promise<{ yaml?: string; errors: ValidationError[] }> {
  try {
    const response = await fetch(`${API_BASE}/api/generate-yaml`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const payload = await response.json();
    return { yaml: payload.yaml, errors: payload.errors ?? [] };
  } catch {
    return {
      errors: [
        {
          code: "yaml_generation_failed",
          path: "api",
          message: "Unable to generate YAML right now. Please try again.",
        },
      ],
    };
  }
}

export async function saveDeployment(name: string, status: "draft" | "built", config: DeploymentConfig) {
  const response = await fetch(`${API_BASE}/api/deployments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, status, config }),
  });
  return response.json();
}

export async function listDeployments() {
  const response = await fetch(`${API_BASE}/api/deployments`);
  return response.json();
}

export async function deleteDeployment(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/deployments/${id}`, { method: "DELETE" });
  return response.ok;
}
