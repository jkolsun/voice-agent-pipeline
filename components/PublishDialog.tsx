"use client";

import { useState } from "react";
import { ClientDemo } from "@/lib/types";
import CopyButton from "./CopyButton";
import {
  X,
  Rocket,
  ExternalLink,
  CheckCircle,
  Copy,
  AlertCircle,
} from "lucide-react";

interface PublishDialogProps {
  client: ClientDemo | null;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (client: ClientDemo, voiceId: string, phoneNumber?: string) => void;
}

export default function PublishDialog({
  client,
  isOpen,
  onClose,
  onPublish,
}: PublishDialogProps) {
  const [voiceId, setVoiceId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !client) return null;

  const handleCopyPrompt = () => {
    if (client.artifacts?.production_system_prompt) {
      navigator.clipboard.writeText(client.artifacts.production_system_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = () => {
    if (!voiceId.trim()) return;
    onPublish(client, voiceId.trim(), phoneNumber.trim() || undefined);
    setVoiceId("");
    setPhoneNumber("");
    onClose();
  };

  const handleClose = () => {
    setVoiceId("");
    setPhoneNumber("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Publish to ElevenLabs
                </h2>
                <p className="text-sm text-slate-400">{client.business_name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Step 1: Copy Prompt */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200 mb-2">
                    Copy the production system prompt
                  </p>
                  <button
                    onClick={handleCopyPrompt}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                      copied
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy System Prompt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Create Agent in ElevenLabs */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200 mb-2">
                    Create agent in ElevenLabs and paste the prompt
                  </p>
                  <a
                    href="https://elevenlabs.io/app/conversational-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open ElevenLabs
                  </a>
                </div>
              </div>
            </div>

            {/* Step 3: Enter Voice ID */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200 mb-3">
                    Enter the ElevenLabs Agent ID
                  </p>
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="e.g., abc123xyz"
                    className="input-field"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Find this in your ElevenLabs agent settings
                  </p>
                </div>
              </div>
            </div>

            {/* Optional: Phone Number */}
            <div>
              <label className="label">Phone Number (optional)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +1 (555) 123-4567"
                className="input-field"
              />
              <p className="text-xs text-slate-500 mt-1">
                The phone number assigned to this agent
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Make sure you've tested the agent in ElevenLabs before marking as production.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
            <button
              onClick={handleClose}
              className="flex-1 btn-secondary py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!voiceId.trim()}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Mark as Production
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
