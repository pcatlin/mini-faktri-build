import type { DeploymentConfig, ResourceItem, ServiceItem, ServiceCategory } from "../types/deployment";

interface BuilderCanvasProps {
  config: DeploymentConfig;
  onConfigChange: (next: DeploymentConfig) => void;
}

export function BuilderCanvas({ config, onConfigChange }: BuilderCanvasProps) {
  const removeResource = (resourceId: string) => {
    onConfigChange({ ...config, resources: config.resources.filter((resource) => resource.id !== resourceId) });
  };

  const removeService = (serviceId: string) => {
    onConfigChange({ ...config, services: config.services.filter((service) => service.id !== serviceId) });
  };

  return (
    <section
      data-testid="builder-canvas"
      className="rounded-lg border border-dashed border-cyan-500 bg-slate-800 p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("application/x-faktri");
        if (!raw) return;

        const parsed = JSON.parse(raw) as { kind: "resource" | "service"; value: string; label?: string };
        if (parsed.kind === "resource") {
          const newResource: ResourceItem = {
            id: crypto.randomUUID(),
            type: parsed.value as ResourceItem["type"],
            count: parsed.value === "cpu" ? 1 : undefined,
            storageType: parsed.value === "disk" ? "ssd" : undefined,
          };
          onConfigChange({ ...config, resources: [...config.resources, newResource] });
          return;
        }

        const newService: ServiceItem = {
          id: crypto.randomUUID(),
          name: parsed.label ?? parsed.value,
          category: parsed.value as ServiceCategory,
        };
        onConfigChange({ ...config, services: [...config.services, newService] });
      }}
    >
      <h2 className="mb-2 text-sm font-semibold text-slate-100">Deployment Builder</h2>
      <p className="mb-4 text-xs text-slate-300">Drag resources and software here to build a system.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold text-slate-100">Resources</h3>
          <ul className="space-y-2">
            {config.resources.map((resource) => (
              <li key={resource.id} className="flex items-center justify-between rounded bg-slate-700 px-3 py-2 text-sm text-slate-100">
                <span>
                  {resource.type.toUpperCase()} {resource.storageType ? `(${resource.storageType})` : ""}
                </span>
                <button
                  type="button"
                  data-testid={`remove-resource-${resource.id}`}
                  aria-label={`Remove ${resource.type}`}
                  onClick={() => removeResource(resource.id)}
                  className="rounded bg-slate-600 px-2 py-0.5 text-xs"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold text-slate-100">Services</h3>
          <ul className="space-y-2">
            {config.services.map((service) => (
              <li key={service.id} className="flex items-center justify-between rounded bg-slate-700 px-3 py-2 text-sm text-slate-100">
                <span>{service.name}</span>
                <button
                  type="button"
                  data-testid={`remove-service-${service.id}`}
                  aria-label={`Remove ${service.name}`}
                  onClick={() => removeService(service.id)}
                  className="rounded bg-slate-600 px-2 py-0.5 text-xs"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
