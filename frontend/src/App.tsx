import { useEffect, useState } from "react";

import { deleteDeployment, generateYaml, listDeployments, saveDeployment, validateConfig } from "./api";
import { BuilderCanvas } from "./components/BuilderCanvas";
import { Palette } from "./components/Palette";
import type { DeploymentConfig, ValidationError } from "./types/deployment";

const initialConfig: DeploymentConfig = {
  name: "mission-alpha",
  resources: [],
  services: [],
};

interface StoredDeployment {
  id: number;
  name: string;
  status: "draft" | "built";
  payload: DeploymentConfig;
}

export default function App() {
  const [config, setConfig] = useState<DeploymentConfig>(initialConfig);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [yaml, setYaml] = useState("");
  const [saved, setSaved] = useState<StoredDeployment[]>([]);

  const refreshDeployments = async () => {
    const items = await listDeployments();
    setSaved(items);
  };

  useEffect(() => {
    refreshDeployments().catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 p-6 text-slate-100">
      <h1 className="mb-4 text-2xl font-bold">Mini FAKTRI Deployment Builder</h1>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        <Palette />
        <BuilderCanvas config={config} onConfigChange={setConfig} />
        <section className="space-y-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <h2 className="text-sm font-semibold">Actions</h2>
          <label className="block text-xs">
            Deployment Name
            <input
              data-testid="deployment-name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="mt-1 w-full rounded bg-slate-700 px-2 py-1 text-sm"
            />
          </label>
          <button
            data-testid="validate-btn"
            onClick={async () => {
              const issues = await validateConfig(config);
              setErrors(issues);
              setValidationMessage(issues.length === 0 ? "Passes validation" : "");
            }}
            className="w-full rounded bg-cyan-700 px-3 py-2 text-sm"
          >
            Validate
          </button>
          <button
            data-testid="generate-yaml-btn"
            onClick={async () => {
              const result = await generateYaml(config);
              setErrors(result.errors);
              setValidationMessage(result.errors.length === 0 ? "Passes validation" : "");
              setYaml(result.errors.length === 0 ? (result.yaml ?? "") : "");
            }}
            className="w-full rounded bg-emerald-700 px-3 py-2 text-sm"
          >
            Generate YAML
          </button>
          <button
            data-testid="save-draft-btn"
            onClick={async () => {
              await saveDeployment(config.name, "draft", config);
              await refreshDeployments();
            }}
            className="w-full rounded bg-amber-700 px-3 py-2 text-sm"
          >
            Save Draft
          </button>
          <button
            data-testid="save-build-btn"
            onClick={async () => {
              const response = await saveDeployment(config.name, "built", config);
              if (response.errors) {
                setErrors(response.errors);
                setValidationMessage("");
                return;
              }
              setErrors([]);
              setValidationMessage("Passes validation");
              await refreshDeployments();
            }}
            className="w-full rounded bg-indigo-700 px-3 py-2 text-sm"
          >
            Save Build
          </button>
          <button
            data-testid="reset-build-btn"
            onClick={() => {
              setConfig(initialConfig);
              setErrors([]);
              setValidationMessage("");
              setYaml("");
            }}
            className="w-full rounded bg-slate-600 px-3 py-2 text-sm"
          >
            Reset Build
          </button>
          {validationMessage && (
            <div data-testid="validation-success"
                 className="rounded border border-emerald-500 bg-emerald-950 p-2 text-xs">
              {validationMessage}
            </div>
          )}
          {errors.length > 0 && (
            <div data-testid="error-list"
                 className="rounded border border-rose-500 bg-rose-950 p-2 text-xs">
              {errors.map((error) => (
                <p key={`${error.code}-${error.path}`}>{error.message}</p>
              ))}
            </div>
          )}
          {yaml && (
            <pre data-testid="yaml-output"
                 className="overflow-auto rounded bg-slate-900 p-2 text-xs">
              {yaml}
            </pre>
          )}
          <div>
            <h3 className="mb-2 text-xs font-semibold">Saved Systems</h3>
            <ul className="space-y-2" data-testid="saved-list">
              {saved.map((item) => (
                <li key={item.id} className="rounded bg-slate-700 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>
                      {item.name} ({item.status})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`load-${item.id}`}
                        onClick={() => {
                          setConfig(item.payload);
                          setErrors([]);
                          setValidationMessage("");
                          setYaml("");
                        }}
                        className="rounded bg-slate-600 px-2 py-1"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-saved-${item.id}`}
                        aria-label={`Delete ${item.name}`}
                        onClick={async () => {
                          await deleteDeployment(item.id);
                          await refreshDeployments();
                        }}
                        className="rounded bg-rose-700 px-2 py-1"
                      >
                        x
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
