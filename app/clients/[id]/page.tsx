"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClientDemo } from "@/lib/types";
import { getClient, saveClient, deleteClient } from "@/lib/storage";
import {
  generateDemoArtifacts,
  approveClient,
  generateProductionArtifacts,
} from "@/lib/generators";
import { generateProductionChecklist } from "@/lib/templates";
import ClientForm from "@/components/ClientForm";
import ArtifactViewer from "@/components/ArtifactViewer";
import StatusBadge from "@/components/StatusBadge";
import ProductionChecklist from "@/components/ProductionChecklist";
import CopyButton from "@/components/CopyButton";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  Rocket,
  Download,
  Package,
  FileText,
  Settings,
  Zap,
  AlertTriangle,
} from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ViewMode = "overview" | "edit" | "artifacts" | "production";

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientDemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loaded = getClient(id);
    if (loaded) {
      setClient(loaded);
    }
    setLoading(false);
  }, [id]);

  const handleSaveEdit = (data: Partial<ClientDemo>) => {
    if (!client) return;
    const updated = { ...client, ...data, updated_at: new Date().toISOString() };
    saveClient(updated);
    setClient(updated);
    window.dispatchEvent(new Event("clientsUpdated"));
    setViewMode("overview");
  };

  const handleRegenerateArtifacts = () => {
    if (!client) return;
    const updated = generateDemoArtifacts(client);
    saveClient(updated);
    setClient(updated);
    window.dispatchEvent(new Event("clientsUpdated"));
  };

  const handleApprove = () => {
    if (!client) return;
    const approved = approveClient(client);
    const withProductionArtifacts = generateProductionArtifacts(approved);
    saveClient(withProductionArtifacts);
    setClient(withProductionArtifacts);
    window.dispatchEvent(new Event("clientsUpdated"));
    setViewMode("production");
  };

  const handlePromoteToProduction = () => {
    if (!client) return;
    const updated = {
      ...client,
      status: "production" as const,
      updated_at: new Date().toISOString(),
    };
    saveClient(updated);
    setClient(updated);
    window.dispatchEvent(new Event("clientsUpdated"));
  };

  const handleDelete = () => {
    deleteClient(id);
    window.dispatchEvent(new Event("clientsUpdated"));
    router.push("/");
  };

  const handleExportZip = async () => {
    if (!client || !client.artifacts) return;

    // Dynamically import JSZip
    const JSZip = (await import("jszip")).default;
    const { saveAs } = await import("file-saver");

    const zip = new JSZip();
    const folderName = client.business_name.toLowerCase().replace(/\s+/g, "_");
    const folder = zip.folder(folderName);

    if (!folder) return;

    // Add all artifacts
    if (client.artifacts.demo_config) {
      folder.file("demo_client_config.json", client.artifacts.demo_config);
    }
    if (client.artifacts.demo_system_prompt) {
      folder.file("demo_system_prompt.txt", client.artifacts.demo_system_prompt);
    }
    if (client.artifacts.client_test_instructions) {
      folder.file(
        "client_test_instructions.txt",
        client.artifacts.client_test_instructions
      );
    }
    if (client.artifacts.production_system_prompt) {
      folder.file(
        "production_system_prompt.txt",
        client.artifacts.production_system_prompt
      );
    }

    // Add production checklist if approved
    if (client.status === "approved" || client.status === "production") {
      folder.file("production_checklist.md", generateProductionChecklist(client));
    }

    // Add client summary
    const summary = {
      business_name: client.business_name,
      industry: client.industry,
      service_area: client.service_area,
      services: client.services,
      status: client.status,
      created_at: client.created_at,
      updated_at: client.updated_at,
    };
    folder.file("client_summary.json", JSON.stringify(summary, null, 2));

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${folderName}_client_pack.zip`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          Client Not Found
        </h1>
        <p className="text-slate-400 mb-6">
          This client may have been deleted or the ID is invalid.
        </p>
        <Link href="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-100">
              {client.business_name}
            </h1>
            <StatusBadge status={client.status} size="lg" />
          </div>
          <p className="text-slate-400 mt-1">
            {client.industry} • {client.service_area}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportZip}
            className="btn-secondary"
            title="Export Client Pack"
          >
            <Package className="w-4 h-4 mr-2" />
            Export ZIP
          </button>

          {client.status === "demo_ready" && (
            <button onClick={handleApprove} className="btn-success">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Demo
            </button>
          )}

          {client.status === "approved" && (
            <button onClick={handlePromoteToProduction} className="btn-primary">
              <Rocket className="w-4 h-4 mr-2" />
              Go to Production
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-700 mb-8">
        <button
          onClick={() => setViewMode("overview")}
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === "overview"
              ? "border-brand-500 text-brand-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setViewMode("artifacts")}
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === "artifacts"
              ? "border-brand-500 text-brand-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Artifacts
        </button>
        <button
          onClick={() => setViewMode("edit")}
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            viewMode === "edit"
              ? "border-brand-500 text-brand-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Edit3 className="w-4 h-4 inline mr-2" />
          Edit
        </button>
        {(client.status === "approved" || client.status === "production") && (
          <button
            onClick={() => setViewMode("production")}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              viewMode === "production"
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Production
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Services</h3>
              <div className="flex flex-wrap gap-2">
                {client.services.map((service) => (
                  <span
                    key={service}
                    className="px-2.5 py-1 bg-slate-700 rounded-md text-sm text-slate-200"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Hours</h3>
              <p className="text-sm text-slate-200">
                Weekday: {client.hours.weekday}
              </p>
              <p className="text-sm text-slate-200">
                Weekend: {client.hours.weekend}
              </p>
              <p className="text-xs text-slate-500 mt-1">{client.hours.timezone}</p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                Agent Settings
              </h3>
              <p className="text-sm text-slate-200">
                Goal: {client.after_hours_goal.replace("_", " ")}
              </p>
              <p className="text-sm text-slate-200">Tone: {client.tone}</p>
            </div>
          </div>

          {/* Transfer Rules */}
          {client.transfer_rules.length > 0 && (
            <div className="card">
              <h3 className="card-header">Transfer Rules</h3>
              <div className="space-y-3">
                {client.transfer_rules.map((rule, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-800 rounded-lg flex items-center gap-4"
                  >
                    <span className="text-sm text-slate-400">IF</span>
                    <span className="text-sm text-slate-200 flex-1">
                      {rule.condition}
                    </span>
                    <span className="text-sm text-slate-400">THEN</span>
                    <span className="text-sm text-slate-200">{rule.action}</span>
                    {rule.phone && (
                      <span className="text-sm text-brand-400">{rule.phone}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleRegenerateArtifacts} className="btn-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Artifacts
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Client
            </button>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
            Created: {new Date(client.created_at).toLocaleString()} • Last updated:{" "}
            {new Date(client.updated_at).toLocaleString()}
          </div>
        </div>
      )}

      {viewMode === "artifacts" && client.artifacts && (
        <div className="space-y-6">
          <ArtifactViewer
            artifacts={client.artifacts}
            businessName={client.business_name}
          />
        </div>
      )}

      {viewMode === "edit" && (
        <div className="max-w-4xl">
          <ClientForm
            initialData={client}
            onSubmit={(data) => {
              handleSaveEdit(data);
              handleRegenerateArtifacts();
            }}
            onCancel={() => setViewMode("overview")}
            submitLabel="Save & Regenerate"
            isEditing
          />
        </div>
      )}

      {viewMode === "production" && (
        <div className="space-y-6">
          {client.status === "approved" && (
            <div className="card bg-gradient-to-r from-brand-900/50 to-brand-800/30 border-brand-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-brand-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100">
                    Demo Approved!
                  </h3>
                  <p className="text-sm text-slate-400">
                    Complete the checklist below to deploy to production.
                  </p>
                </div>
                <button
                  onClick={handlePromoteToProduction}
                  className="btn-primary"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Mark as Production
                </button>
              </div>
            </div>
          )}

          {client.status === "production" && (
            <div className="card bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">
                    In Production
                  </h3>
                  <p className="text-sm text-slate-400">
                    This voice agent is live and handling calls.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ProductionChecklist />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Delete Client?
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete "{client.business_name}"? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
