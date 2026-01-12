"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { ClientDemo } from "@/lib/types";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Settings,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ElevenLabsWidgetProps {
  client: ClientDemo;
  agentId?: string;
  onClose?: () => void;
}

export default function ElevenLabsWidget({
  client,
  agentId,
  onClose,
}: ElevenLabsWidgetProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setIsConnecting(false);
      setError(null);
    },
    onDisconnect: () => {
      setIsConnecting(false);
    },
    onError: (err) => {
      setError(typeof err === "string" ? err : "Connection failed");
      setIsConnecting(false);
    },
    onMessage: (message) => {
      console.log("Agent message:", message);
    },
  });

  const startConversation = useCallback(async () => {
    if (!agentId) {
      setError("No ElevenLabs Agent ID configured. Please set up the agent first.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with the agent
      await conversation.startSession({
        agentId: agentId,
        connectionType: "websocket",
      } as any);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access to test the voice agent.");
      } else {
        setError(err.message || "Failed to start conversation");
      }
      setIsConnecting(false);
    }
  }, [agentId, conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isConnected ? "bg-emerald-500/20" : "bg-slate-700"
          }`}>
            <Phone className={`w-6 h-6 ${isConnected ? "text-emerald-400" : "text-slate-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Live Voice Test</h3>
            <p className="text-sm text-slate-400">
              {isConnected ? "Connected - Speak now" : "Test your agent in real-time"}
            </p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
            <span className="text-xs text-slate-400">
              {isSpeaking ? "Agent speaking..." : "Listening..."}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400">{error}</p>
            {!agentId && (
              <p className="text-xs text-red-400/70 mt-1">
                Create an agent in ElevenLabs first, then add the Agent ID in the Publish dialog.
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Agent ID Warning */}
      {!agentId && !error && (
        <div className="flex items-start gap-2 p-4 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-400">No ElevenLabs Agent configured</p>
            <p className="text-xs text-amber-400/70 mt-1">
              To test live, first create an agent in ElevenLabs with the system prompt, then publish with the Agent ID.
            </p>
          </div>
        </div>
      )}

      {/* Agent Info */}
      {agentId && (
        <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Agent ID</span>
            <code className="text-xs text-brand-400 bg-slate-800 px-2 py-1 rounded">
              {agentId}
            </code>
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isConnected ? (
          <button
            onClick={startConversation}
            disabled={isConnecting || !agentId}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all ${
              agentId
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Start Test Call
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-medium bg-red-600 hover:bg-red-500 text-white transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        )}
      </div>

      {/* Status Indicator */}
      {isConnected && (
        <div className="mt-6 flex items-center justify-center">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isSpeaking ? "bg-slate-700" : "bg-emerald-500/20"
              }`}>
                <Mic className={`w-5 h-5 ${isSpeaking ? "text-slate-500" : "text-emerald-400"}`} />
              </div>
              <span className="text-xs text-slate-500">You</span>
            </div>
            <div className="w-16 h-0.5 bg-slate-700 relative">
              <div className={`absolute inset-0 bg-emerald-500 transition-all duration-300 ${
                isSpeaking ? "w-full" : "w-0"
              }`} style={{ transformOrigin: isSpeaking ? "left" : "right" }} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isSpeaking ? "bg-emerald-500/20" : "bg-slate-700"
              }`}>
                <Volume2 className={`w-5 h-5 ${isSpeaking ? "text-emerald-400" : "text-slate-500"}`} />
              </div>
              <span className="text-xs text-slate-500">Agent</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isConnected && agentId && (
        <p className="text-center text-xs text-slate-500 mt-4">
          Click "Start Test Call" to have a live conversation with your voice agent.
          Make sure your microphone is enabled.
        </p>
      )}
    </div>
  );
}
