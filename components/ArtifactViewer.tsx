"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import { Download, FileCode, FileText, Settings } from "lucide-react";

interface ArtifactViewerProps {
  artifacts: {
    demo_config?: string;
    demo_system_prompt?: string;
    client_test_instructions?: string;
    production_system_prompt?: string;
  };
  businessName: string;
}

type ArtifactKey = keyof ArtifactViewerProps["artifacts"];

interface ArtifactMeta {
  key: ArtifactKey;
  label: string;
  filename: string;
  icon: React.ReactNode;
  description: string;
}

const ARTIFACT_META: ArtifactMeta[] = [
  {
    key: "demo_config",
    label: "Demo Config",
    filename: "demo_client_config.json",
    icon: <Settings className="w-4 h-4" />,
    description: "Configuration JSON for the demo agent",
  },
  {
    key: "demo_system_prompt",
    label: "Demo Prompt",
    filename: "demo_system_prompt.txt",
    icon: <FileCode className="w-4 h-4" />,
    description: "System prompt for the demo agent",
  },
  {
    key: "client_test_instructions",
    label: "Test Instructions",
    filename: "client_test_instructions.txt",
    icon: <FileText className="w-4 h-4" />,
    description: "Instructions for client testing",
  },
  {
    key: "production_system_prompt",
    label: "Production Prompt",
    filename: "production_system_prompt.txt",
    icon: <FileCode className="w-4 h-4" />,
    description: "System prompt for production agent",
  },
];

export default function ArtifactViewer({
  artifacts,
  businessName,
}: ArtifactViewerProps) {
  const availableArtifacts = ARTIFACT_META.filter(
    (meta) => artifacts[meta.key]
  );

  const [activeTab, setActiveTab] = useState<ArtifactKey>(
    availableArtifacts[0]?.key || "demo_config"
  );

  if (availableArtifacts.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">No artifacts generated yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Generate demo artifacts to view them here
        </p>
      </div>
    );
  }

  const activeArtifact = ARTIFACT_META.find((m) => m.key === activeTab);
  const content = artifacts[activeTab] || "";

  const handleDownload = () => {
    if (!activeArtifact || !content) return;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeArtifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card p-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-800/50">
        {availableArtifacts.map((meta) => (
          <button
            key={meta.key}
            onClick={() => setActiveTab(meta.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === meta.key
                ? "border-brand-500 text-brand-400 bg-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {meta.icon}
            {meta.label}
          </button>
        ))}
      </div>

      {/* Content Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border-b border-slate-700/50">
        <div>
          <p className="text-sm font-medium text-slate-200">
            {activeArtifact?.filename}
          </p>
          <p className="text-xs text-slate-500">{activeArtifact?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={content} />
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[500px] overflow-auto p-4">
        <pre className="artifact-content text-slate-300">{content}</pre>
      </div>
    </div>
  );
}
