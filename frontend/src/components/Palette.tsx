import type { ResourceType, ServiceCategory } from "../types/deployment";

const RESOURCES: ResourceType[] = ["cpu", "memory", "disk", "gpu"];
const SOFTWARE: Array<{ category: ServiceCategory; label: string }> = [
  { category: "os", label: "OS" },
  { category: "db", label: "DB" },
  { category: "comms", label: "Comms" },
  { category: "mapping", label: "Mapping" },
  { category: "drone_control_center", label: "Drone Control Center" },
  { category: "vpn", label: "VPN" },
  { category: "other_defense", label: "Other Defense Software" },
];

export function Palette() {
  return (
    <aside className="space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-100">Resources</h2>
        <div className="space-y-2">
          {RESOURCES.map((resource) => (
            <button
              key={resource}
              type="button"
              draggable
              data-testid={`resource-${resource}`}
              onDragStart={(e) => {
                e.dataTransfer.setData("application/x-faktri", JSON.stringify({ kind: "resource", value: resource }));
              }}
              className="w-full rounded bg-slate-700 px-3 py-2 text-left text-sm text-slate-100"
            >
              {resource.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-100">Software</h2>
        <div className="space-y-2">
          {SOFTWARE.map((item) => (
            <button
              key={item.category}
              type="button"
              draggable
              data-testid={`service-${item.category}`}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/x-faktri",
                  JSON.stringify({ kind: "service", value: item.category, label: item.label }),
                );
              }}
              className="w-full rounded bg-slate-700 px-3 py-2 text-left text-sm text-slate-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
