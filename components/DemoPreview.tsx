"use client";

import { useState } from "react";
import { ClientDemo } from "@/lib/types";
import CopyButton from "./CopyButton";
import ElevenLabsWidget from "./ElevenLabsWidget";
import {
  X,
  Play,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Mic,
  Volume2,
  FileText,
  ExternalLink,
  Copy,
  CheckCircle,
  PhoneCall,
} from "lucide-react";

interface DemoPreviewProps {
  client: ClientDemo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoPreview({
  client,
  isOpen,
  onClose,
}: DemoPreviewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "prompt" | "test" | "live">("overview");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen || !client) return null;

  const handleCopyPrompt = () => {
    if (client.artifacts?.demo_system_prompt) {
      navigator.clipboard.writeText(client.artifacts.demo_system_prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  // Check if client has ElevenLabs agent configured
  const hasAgentId = !!client.production_details?.elevenlabs_voice_id;

  // Generate sample conversation based on client data
  const sampleConversation = [
    {
      role: "agent",
      text: `Thank you for calling ${client.business_name}! This is your AI assistant. How can I help you today?`,
    },
    {
      role: "caller",
      text: "Hi, I need to schedule a service appointment.",
    },
    {
      role: "agent",
      text: `I'd be happy to help you schedule an appointment. We offer ${client.services.slice(0, 3).join(", ")}${client.services.length > 3 ? " and more" : ""}. Which service are you interested in?`,
    },
    {
      role: "caller",
      text: `I need ${client.services[0]?.toLowerCase() || "help with your services"}.`,
    },
    {
      role: "agent",
      text: `Great choice! Let me get some information to schedule your ${client.services[0] || "service"} appointment. May I have your name and the best phone number to reach you?`,
    },
  ];

  const tabs = [
    { id: "live", label: "Live Test", icon: PhoneCall },
    { id: "overview", label: "Overview", icon: Volume2 },
    { id: "prompt", label: "System Prompt", icon: FileText },
    { id: "test", label: "Test Script", icon: MessageSquare },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 bg-slate-900 border border-slate-700 rounded-xl z-50 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Demo Preview: {client.business_name}
              </h2>
              <p className="text-sm text-slate-400">
                {client.industry} • {client.service_area}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              } ${tab.id === "live" ? "bg-emerald-500/10" : ""}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "live" && hasAgentId && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "live" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* ElevenLabs Widget */}
              <ElevenLabsWidget
                client={client}
                agentId={client.production_details?.elevenlabs_voice_id}
              />

              {/* Setup Instructions if no agent */}
              {!hasAgentId && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="font-semibold text-slate-100 mb-4">How to Set Up Live Testing</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="text-sm text-slate-200">Copy the system prompt</p>
                        <p className="text-xs text-slate-400 mt-1">Go to "System Prompt" tab and copy it</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="text-sm text-slate-200">Create agent in ElevenLabs</p>
                        <a
                          href="https://elevenlabs.io/app/conversational-ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open ElevenLabs Conversational AI
                        </a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="text-sm text-slate-200">Paste the system prompt and create the agent</p>
                        <p className="text-xs text-slate-400 mt-1">Configure voice and other settings as needed</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">4</span>
                      <div>
                        <p className="text-sm text-slate-200">Copy the Agent ID and publish</p>
                        <p className="text-xs text-slate-400 mt-1">Use the "Publish" button on the client card to save the Agent ID</p>
                      </div>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Agent Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-850 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Voice Agent Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Tone</p>
                    <p className="text-sm font-medium text-slate-200 capitalize">{client.tone}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">After Hours</p>
                    <p className="text-sm font-medium text-slate-200 capitalize">
                      {client.after_hours_goal.replace("_", " ")}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Weekday Hours</p>
                    <p className="text-sm font-medium text-slate-200">{client.hours.weekday}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Weekend Hours</p>
                    <p className="text-sm font-medium text-slate-200">{client.hours.weekend}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Services the Agent Handles</h3>
                <div className="flex flex-wrap gap-2">
                  {client.services.map((service, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm bg-brand-500/10 text-brand-400 rounded-lg border border-brand-500/20"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Conversation */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-4">Sample Conversation</h3>
                <div className="space-y-4">
                  {sampleConversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "caller" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "caller"
                            ? "bg-brand-600 text-white rounded-br-md"
                            : "bg-slate-700 text-slate-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("live")}
                  className="flex-1 btn-success py-3 justify-center"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Test Live
                </button>
                <button
                  onClick={handleCopyPrompt}
                  className="flex-1 btn-secondary py-3 justify-center"
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy System Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "prompt" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                  This is the system prompt that defines your voice agent's behavior.
                  Copy and paste it into ElevenLabs.
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className={`btn-secondary ${copiedPrompt ? "bg-emerald-600 border-emerald-600" : ""}`}
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl border border-slate-700 p-6 overflow-auto max-h-[60vh]">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {client.artifacts?.demo_system_prompt || "No system prompt generated yet."}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "test" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-sm text-amber-400">
                  Use these test scenarios to evaluate your voice agent before approving.
                </p>
              </div>

              {/* Test Scenarios */}
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">1</span>
                    <h4 className="font-medium text-slate-200">New Customer Inquiry</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Call and say: "Hi, I'm looking for help with {client.services[0]?.toLowerCase() || "your services"}.
                    Can you tell me more about what you offer?"
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Expected:</strong> Agent should greet warmly, explain services, and try to capture lead information.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">2</span>
                    <h4 className="font-medium text-slate-200">Service Area Check</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Call and say: "Do you service the {client.service_area} area? I'm located nearby."
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Expected:</strong> Agent should confirm service area and proceed with booking or lead capture.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">3</span>
                    <h4 className="font-medium text-slate-200">Pricing Question</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Call and say: "How much do you charge for {client.services[0]?.toLowerCase() || "your services"}?"
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Expected:</strong> Agent should NOT give specific pricing. Should offer to have someone call back with a quote.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">4</span>
                    <h4 className="font-medium text-slate-200">After Hours Call</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Test what happens when calling outside business hours ({client.hours.weekday}).
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Expected:</strong> Agent should handle according to after-hours setting: {client.after_hours_goal.replace("_", " ")}.
                  </p>
                </div>
              </div>

              {/* Test Instructions Download */}
              {client.artifacts?.client_test_instructions && (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-200 mb-1">Full Test Instructions</h4>
                      <p className="text-sm text-slate-400">Download detailed test instructions to share with your client.</p>
                    </div>
                    <CopyButton text={client.artifacts.client_test_instructions} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
