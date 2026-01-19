"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ClientDemo, DemoLink } from "@/lib/types";
import { getClient, getDemoLinkBySlug, incrementDemoLinkUsage, isDemoLinkValid } from "@/lib/storage";
import {
  Mic,
  Clock,
  AlertCircle,
  Building2,
  Phone,
  Shield,
  PhoneCall,
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

type DemoMode = "voice" | "chat";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

export default function DemoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [demoLink, setDemoLink] = useState<DemoLink | null>(null);
  const [client, setClient] = useState<ClientDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoMode, setDemoMode] = useState<DemoMode>("chat");
  const [callStarted, setCallStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Initialize chat with greeting
    if (clientData) {
      setMessages([{
        id: "1",
        role: "assistant",
        content: `Hi! Welcome to ${clientData.business_name}. I'm here to help you with any questions about our services. How can I assist you today?`,
        timestamp: new Date()
      }]);
    }

    incrementDemoLinkUsage(slug);
  }, [slug]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Simulated chat responses based on client data
  const getAIResponse = (userMessage: string): string => {
    if (!client) return "I'm here to help!";

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("service") || lowerMessage.includes("offer") || lowerMessage.includes("do you")) {
      return `We offer a wide range of services including ${client.services.slice(0, 3).join(", ")}, and more. Would you like me to tell you more about any specific service?`;
    }

    if (lowerMessage.includes("hour") || lowerMessage.includes("open") || lowerMessage.includes("available")) {
      return `Our business hours are ${client.hours?.weekday || "Monday-Friday 9AM-5PM"}. Weekend hours: ${client.hours?.weekend || "By appointment"}. Would you like to schedule an appointment?`;
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("quote") || lowerMessage.includes("estimate")) {
      return "I'd be happy to help you get a quote! To provide an accurate estimate, I'll need a few details. Could you tell me more about what you're looking for?";
    }

    if (lowerMessage.includes("appointment") || lowerMessage.includes("schedule") || lowerMessage.includes("book")) {
      return "I can help you schedule an appointment! What day and time works best for you? We have availability this week.";
    }

    if (lowerMessage.includes("location") || lowerMessage.includes("where") || lowerMessage.includes("area")) {
      return `We proudly serve ${client.service_area}. Is your location within our service area?`;
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("call")) {
      return "You can reach us directly, or I can have someone from our team call you back. Would you like to leave your phone number?";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return `Hello! Thanks for reaching out to ${client.business_name}. How can I help you today?`;
    }

    return `Thanks for your question! At ${client.business_name}, we're committed to providing excellent service. Is there anything specific about our ${client.services[0] || "services"} I can help you with?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(userMessage.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-925 to-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-brand-400 animate-pulse" />
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
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-white">Lead Capture System</span>
              <p className="text-xs text-slate-500">AI-Powered Demo</p>
            </div>
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
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Business Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-4">
            <Building2 className="w-4 h-4" />
            {client.industry}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{client.business_name}</h1>
          <p className="text-slate-400">{client.service_area}</p>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            24/7 AI Response
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Instant Lead Capture
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Never Miss a Call
          </div>
        </div>

        {/* Demo Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <button
              onClick={() => setDemoMode("chat")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                demoMode === "chat"
                  ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Website Chatbot
            </button>
            <button
              onClick={() => setDemoMode("voice")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                demoMode === "voice"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Phone className="w-5 h-5" />
              Voice Agent
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Info Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                {demoMode === "chat" ? "Website Chatbot" : "Voice Agent"} Features
              </h3>

              {demoMode === "chat" ? (
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Instant Website Engagement</p>
                      <p className="text-sm text-slate-400">Captures leads the moment they land on your site</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Answers Questions 24/7</p>
                      <p className="text-sm text-slate-400">Trained on your services, pricing, and FAQs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Books Appointments</p>
                      <p className="text-sm text-slate-400">Integrates with your calendar for seamless scheduling</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Collects Contact Info</p>
                      <p className="text-sm text-slate-400">Gathers name, phone, email for follow-up</p>
                    </div>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Answers Every Call</p>
                      <p className="text-sm text-slate-400">No more missed calls or voicemail limbo</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Natural Conversation</p>
                      <p className="text-sm text-slate-400">Sounds human, handles complex questions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Qualifies Leads</p>
                      <p className="text-sm text-slate-400">Asks the right questions before transferring</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">After-Hours Coverage</p>
                      <p className="text-sm text-slate-400">Captures leads even when you're closed</p>
                    </div>
                  </li>
                </ul>
              )}
            </div>

            {/* Services */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Services Covered</h3>
              <div className="flex flex-wrap gap-2">
                {client.services.map((service, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Demo Widget */}
          <div className="relative">
            <div className={`absolute -inset-4 rounded-3xl blur-2xl ${
              demoMode === "chat"
                ? "bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20"
                : "bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-emerald-600/20"
            }`} />

            {demoMode === "chat" ? (
              /* Chat Widget */
              <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-violet-600/20 to-violet-500/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{client.business_name}</h3>
                      <p className="text-xs text-emerald-400">Online now</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-violet-500 to-violet-600"
                          : "bg-slate-700"
                      }`}>
                        {message.role === "assistant" ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.role === "assistant"
                          ? "bg-slate-800 text-slate-100 rounded-tl-md"
                          : "bg-violet-600 text-white rounded-tr-md"
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-800 rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white flex items-center justify-center hover:from-violet-500 hover:to-violet-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Try asking about services, pricing, or scheduling
                  </p>
                </div>
              </div>
            ) : (
              /* Voice Widget */
              <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Phone CTA */}
                {demoLink.demo_phone_number && (
                  <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-emerald-600/20 to-emerald-500/10">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-lg animate-pulse" />
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <PhoneCall className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">Call to Try It Live</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Dial now to speak with the AI voice agent
                      </p>
                      <a
                        href={`tel:${demoLink.demo_phone_number.replace(/\D/g, '')}`}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-xl hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                      >
                        <Phone className="w-6 h-6" />
                        {demoLink.demo_phone_number}
                      </a>
                    </div>
                  </div>
                )}

                {/* Voice Demo Body */}
                <div className="p-8">
                  {!callStarted ? (
                    <div className="text-center">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                        <button
                          onClick={() => setCallStarted(true)}
                          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
                        >
                          <Mic className="w-10 h-10 text-white" />
                        </button>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {demoLink.demo_phone_number ? "Or Try Web Demo" : "Start Voice Demo"}
                      </h3>
                      <p className="text-slate-400 mb-6">
                        Click to start a conversation with the AI
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <Mic className="w-10 h-10 text-white animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Listening...</h3>
                      <p className="text-slate-400 mb-6">Speak naturally - the AI is listening</p>

                      {timeRemaining !== null && timeRemaining <= 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <p className="text-amber-400 text-sm">
                            Demo time has ended. Thank you for trying our voice assistant!
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => setCallStarted(false)}
                        className="px-6 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        End Demo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-600/10 to-violet-600/10 border border-brand-500/20">
            <p className="text-slate-300">Ready to capture more leads for your business?</p>
            <div className="flex items-center gap-2 text-brand-400 font-medium">
              <span>Get started today</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4" />
            <span>Private demo link</span>
          </div>
        </div>
      </main>
    </div>
  );
}
