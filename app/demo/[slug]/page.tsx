"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClientDemo, DemoLink } from "@/lib/types";
import { getClient, getDemoLinkBySlug, incrementDemoLinkUsage, isDemoLinkValid } from "@/lib/storage";
import { Mic, Clock, AlertCircle, Building2, Phone, Shield, PhoneCall } from "lucide-react";

export default function DemoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [demoLink, setDemoLink] = useState<DemoLink | null>(null);
  const [client, setClient] = useState<ClientDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const link = getDemoLinkBySlug(slug);

    if (!link) {
      setError("Demo link not found. It may have been deleted or the URL is incorrect.");
      setIsLoading(false);
      return;
    }

    if (!isDemoLinkValid(link)) {
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        setError("This demo link has expired. Please request a new link from your contact.");
      } else {
        setError("This demo link is no longer active.");
      }
      setIsLoading(false);
      return;
    }

    const clientData = getClient(link.client_id);
    if (!clientData) {
      setError("The business associated with this demo could not be found.");
      setIsLoading(false);
      return;
    }

    setDemoLink(link);
    setClient(clientData);
    setIsLoading(false);

    // Track usage
    incrementDemoLinkUsage(slug);
  }, [slug]);

  // Timer for call duration
  useEffect(() => {
    if (!callStarted || !demoLink) return;

    setTimeRemaining(demoLink.max_duration_seconds);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStarted, demoLink]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-925 to-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center">
            <Mic className="w-8 h-8 text-brand-400 animate-pulse" />
          </div>
          <p className="text-slate-400">Loading demo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-925 to-slate-950 p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Demo Unavailable</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="text-sm text-slate-500">
            If you believe this is an error, please contact the person who shared this link with you.
          </div>
        </div>
      </div>
    );
  }

  if (!client || !demoLink) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-925 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-slate-400">Voice Agent Demo</span>
          </div>
          {callStarted && timeRemaining !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeRemaining < 30 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-300"
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Business Info Card */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-6">
            <Building2 className="w-4 h-4" />
            {client.industry}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{client.business_name}</h1>
          <p className="text-lg text-slate-400 mb-2">{client.service_area}</p>
          <p className="text-slate-500">Try our AI-powered voice assistant</p>
        </div>

        {/* Phone Number Call-to-Action (if available) */}
        {demoLink.demo_phone_number && (
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-emerald-600/20 rounded-2xl blur-xl" />
            <div className="relative rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm overflow-hidden p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-lg animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <PhoneCall className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Call to Try the Demo</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Dial this number to speak with our AI voice agent directly
                  </p>
                  <a
                    href={`tel:${demoLink.demo_phone_number.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-lg hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                  >
                    <Phone className="w-5 h-5" />
                    {demoLink.demo_phone_number}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Widget Container */}
        <div className="relative max-w-2xl mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-brand-600/20 via-brand-500/10 to-brand-600/20 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            {/* Widget Header */}
            <div className="px-6 py-5 border-b border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    {demoLink.demo_phone_number ? "Web Demo" : "Voice Demo"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {demoLink.demo_phone_number
                      ? "Or try our web-based demo below"
                      : "Speak with our AI assistant"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.floor(demoLink.max_duration_seconds / 60)} min limit</span>
                </div>
              </div>
            </div>

            {/* Widget Body */}
            <div className="p-8">
              {!callStarted ? (
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-brand-500/30 rounded-full blur-xl animate-pulse" />
                    <button
                      onClick={() => setCallStarted(true)}
                      className="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-xl shadow-brand-600/30 hover:shadow-brand-500/40 hover:scale-105 transition-all duration-300"
                    >
                      <Mic className="w-10 h-10 text-white" />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {demoLink.demo_phone_number ? "Start Web Demo" : "Start Voice Demo"}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Click to start a conversation with our AI voice agent
                  </p>

                  {/* Services Preview */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {client.services.slice(0, 4).map((service, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50"
                      >
                        {service}
                      </span>
                    ))}
                    {client.services.length > 4 && (
                      <span className="px-3 py-1.5 text-sm text-slate-500">
                        +{client.services.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  {/* Active call UI - placeholder for ElevenLabs widget */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Mic className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Demo Active</h3>
                  <p className="text-slate-400 mb-4">
                    Speak naturally - the AI is listening
                  </p>

                  {/* ElevenLabs Widget Placeholder */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <p className="text-sm text-slate-500">
                      ElevenLabs Conversational Widget
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Widget will be embedded here with agent ID
                    </p>
                  </div>

                  {timeRemaining !== null && timeRemaining <= 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-amber-400 text-sm">
                        Demo time has ended. Thank you for trying our voice assistant!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setCallStarted(false)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    End Demo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4" />
            <span>This is a private demo link with limited duration</span>
          </div>
        </div>
      </main>
    </div>
  );
}
