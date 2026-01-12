"use client";

import { useState } from "react";
import { ClientDemo } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import ArtifactViewer from "./ArtifactViewer";
import CopyButton from "./CopyButton";
import {
  X,
  Building2,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  Rocket,
  FileCode,
  ExternalLink,
  Play,
  Briefcase,
  MessageCircle,
} from "lucide-react";

interface ClientDetailPanelProps {
  client: ClientDemo | null;
  onClose: () => void;
  onApprove: (client: ClientDemo) => void;
  onPublish: (client: ClientDemo) => void;
  onPreview: (client: ClientDemo) => void;
}

type Tab = "overview" | "artifacts" | "production";

export default function ClientDetailPanel({
  client,
  onClose,
  onApprove,
  onPublish,
  onPreview,
}: ClientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!client) return null;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "overview", label: "Overview", show: true },
    { id: "artifacts", label: "Artifacts", show: !!client.artifacts?.demo_system_prompt },
    { id: "production", label: "Production", show: client.status === "approved" || client.status === "production" },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="h-full flex flex-col slide-panel relative border-l-0" style={{ position: 'relative', right: 'auto' }}>
      {/* Header */}
      <div className="relative px-6 py-5 border-b border-slate-700/50">
        {/* Decorative gradient based on status */}
        <div className={`absolute inset-0 opacity-50 ${
          client.status === 'production' ? 'bg-gradient-to-r from-brand-600/10 via-transparent to-transparent' :
          client.status === 'approved' ? 'bg-gradient-to-r from-emerald-600/10 via-transparent to-transparent' :
          client.status === 'demo_ready' ? 'bg-gradient-to-r from-amber-600/10 via-transparent to-transparent' :
          'bg-gradient-to-r from-slate-600/10 via-transparent to-transparent'
        }`} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-white truncate">
                {client.business_name}
              </h2>
              <StatusBadge status={client.status} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{client.industry}</span>
              <span className="text-slate-600">•</span>
              <MapPin className="w-3.5 h-3.5" />
              <span>{client.service_area}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50 px-4 bg-slate-900/50">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? "tab-active" : "tab-inactive"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Business Info */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                Business Information
              </h3>
              <div className="info-section space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Industry</span>
                  <span className="text-sm text-slate-200 font-medium">{client.industry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Service Area</span>
                  <span className="text-sm text-slate-200 font-medium">{client.service_area}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tone</span>
                  <span className="text-sm text-slate-200 font-medium capitalize">{client.tone}</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {client.services.map((service, i) => (
                  <span key={i} className="service-tag">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Hours of Operation
              </h3>
              <div className="info-section space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Weekdays</span>
                  <span className="text-sm text-slate-200 font-medium">{client.hours.weekday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Weekends</span>
                  <span className="text-sm text-slate-200 font-medium">{client.hours.weekend}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Timezone</span>
                  <span className="text-sm text-slate-200 font-medium">
                    {client.hours.timezone.replace("America/", "").replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* After Hours */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                After Hours Behavior
              </h3>
              <div className="info-section">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-200 capitalize font-medium">
                    {client.after_hours_goal.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "artifacts" && client.artifacts && (
          <div className="animate-fade-in">
            <ArtifactViewer
              artifacts={client.artifacts}
              businessName={client.business_name}
            />
          </div>
        )}

        {activeTab === "production" && (
          <div className="space-y-6 animate-fade-in">
            {/* Production Status */}
            <div className="info-section">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${client.status === "production" ? "bg-brand-500 animate-pulse" : "bg-amber-500"}`} />
                <span className="text-sm font-semibold text-slate-100">
                  {client.status === "production" ? "Live in Production" : "Ready for Production"}
                </span>
              </div>
              {client.production_details?.approved_at && (
                <p className="text-xs text-slate-500">
                  Approved: {new Date(client.production_details.approved_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* ElevenLabs Setup */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">ElevenLabs Voice Setup</h3>
              <div className="info-section space-y-4">
                {client.production_details?.elevenlabs_voice_id ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Voice ID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-brand-400 bg-slate-800 px-3 py-1.5 rounded-lg font-mono">
                        {client.production_details.elevenlabs_voice_id}
                      </code>
                      <CopyButton text={client.production_details.elevenlabs_voice_id} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Voice ID not configured</p>
                )}
                <a
                  href="https://elevenlabs.io/app/voice-lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open ElevenLabs Voice Lab
                </a>
              </div>
            </div>

            {/* Production Prompt */}
            {client.artifacts?.production_system_prompt && (
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-500" />
                  Production System Prompt
                </h3>
                <div className="info-section">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">Copy and paste into ElevenLabs</span>
                    <CopyButton text={client.artifacts.production_system_prompt} />
                  </div>
                  <pre className="text-xs text-slate-400 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono bg-slate-800/50 rounded-lg p-3">
                    {client.artifacts.production_system_prompt.slice(0, 500)}...
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-5 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm space-y-3">
        {client.status === "demo_ready" && (
          <>
            <button
              onClick={() => onPreview(client)}
              className="w-full btn-secondary py-3"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Demo
            </button>
            <button
              onClick={() => onApprove(client)}
              className="w-full btn-success py-3"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Demo
            </button>
          </>
        )}

        {client.status === "approved" && (
          <>
            <button
              onClick={() => onPreview(client)}
              className="w-full btn-secondary py-3"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Demo
            </button>
            <button
              onClick={() => onPublish(client)}
              className="w-full btn-primary py-3"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Publish to ElevenLabs
            </button>
          </>
        )}

        {client.status === "production" && (
          <button
            onClick={() => onPreview(client)}
            className="w-full btn-secondary py-3"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview Demo
          </button>
        )}

        {client.status === "draft" && (
          <div className="text-center text-sm text-slate-500 py-2">
            Complete setup to generate demo artifacts
          </div>
        )}
      </div>
    </div>
  );
}
