"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ClientDemo, DemoLink } from "@/lib/types";
import { getClient, getDemoLinkBySlug, incrementDemoLinkUsage, isDemoLinkValid } from "@/lib/storage";
import {
  Clock,
  AlertCircle,
  Building2,
  Phone,
  Shield,
  PhoneCall,
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  X,
  MapPin,
  Star,
  ChevronRight,
  Menu,
  Mail
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

  // Chat widget state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
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
        content: `Hi! Welcome to ${clientData.business_name}. How can I help you today?`,
        timestamp: new Date()
      }]);
    }

    incrementDemoLinkUsage(slug);
  }, [slug]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear new message indicator when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setHasNewMessage(false);
    }
  }, [isChatOpen]);

  // Check if client is in HVAC industry
  const isHVAC = (industry: string) => {
    const lower = industry.toLowerCase();
    return lower.includes("hvac") || lower.includes("heating") || lower.includes("cooling") || lower.includes("air condition");
  };

  // Simulated chat responses based on client data and industry expertise
  const getAIResponse = (userMessage: string): string => {
    if (!client) return "I'm here to help!";

    const lowerMessage = userMessage.toLowerCase();
    const hvacClient = isHVAC(client.industry);

    // HVAC-specific responses
    if (hvacClient) {
      // AC not cooling / not working
      if ((lowerMessage.includes("ac") || lowerMessage.includes("air condition") || lowerMessage.includes("cooling")) &&
          (lowerMessage.includes("not") || lowerMessage.includes("isn't") || lowerMessage.includes("won't") || lowerMessage.includes("broken") || lowerMessage.includes("problem"))) {
        return "I'm sorry to hear your AC isn't cooling properly. This could be caused by several things - a dirty air filter, low refrigerant, a frozen evaporator coil, or issues with the compressor. A quick thing you can check is your air filter - if it's clogged, that's often the culprit. Would you like me to schedule a technician to diagnose the issue?";
      }

      // Furnace / heating not working
      if ((lowerMessage.includes("furnace") || lowerMessage.includes("heat") || lowerMessage.includes("warm")) &&
          (lowerMessage.includes("not") || lowerMessage.includes("isn't") || lowerMessage.includes("won't") || lowerMessage.includes("broken") || lowerMessage.includes("problem"))) {
        return "I understand - no heat is definitely uncomfortable! Common causes include thermostat issues, a tripped circuit breaker, a dirty filter restricting airflow, or pilot light/ignition problems. First, check that your thermostat is set to 'heat' and the temperature is set above room temp. Also check if the circuit breaker for your furnace has tripped. Would you like me to have a technician come take a look?";
      }

      // Strange noises
      if (lowerMessage.includes("noise") || lowerMessage.includes("sound") || lowerMessage.includes("loud") || lowerMessage.includes("clicking") || lowerMessage.includes("banging") || lowerMessage.includes("squealing") || lowerMessage.includes("grinding")) {
        return "Strange noises from your HVAC system can indicate different issues. Squealing often means a belt or motor issue, grinding suggests motor bearings may be failing, clicking could be an electrical problem, and banging might mean loose parts. If you're hearing a hissing sound, that could indicate a refrigerant leak. What type of noise are you hearing? I can have a technician diagnose it for you.";
      }

      // Refrigerant / freon
      if (lowerMessage.includes("refrigerant") || lowerMessage.includes("freon") || lowerMessage.includes("r22") || lowerMessage.includes("r410")) {
        return "Good question about refrigerant! If your system is low on refrigerant, it usually means there's a leak that needs to be found and repaired. R-22 (Freon) is being phased out, so if you have an older system using R-22, it may be more cost-effective to upgrade to a newer system using R-410A. Our technicians can evaluate your system and provide recommendations.";
      }

      // Filter questions
      if (lowerMessage.includes("filter")) {
        return "Great question! Air filters should be changed every 1-3 months, or monthly if you have pets or allergies. A dirty filter is actually the #1 cause of HVAC problems - it restricts airflow and makes your system work harder, increasing energy costs and wear. What size filter does your system use? I can help make sure you have the right one.";
      }

      // Thermostat issues
      if (lowerMessage.includes("thermostat")) {
        return "Thermostat issues can definitely affect your comfort! If it's not responding, check if it needs new batteries. If temperatures seem off, the thermostat might need recalibration, or it could be in a location that gets direct sunlight or drafts. We also install smart thermostats like Nest and Ecobee, which can save 10-15% on energy bills. Would you like more information?";
      }

      // Emergency / urgent situations
      if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent") || lowerMessage.includes("gas smell") || lowerMessage.includes("carbon monoxide") || lowerMessage.includes("burning smell")) {
        return "If you smell gas, please leave your home immediately and call your gas company from outside. For carbon monoxide alarms, evacuate and call 911. If you're experiencing a burning electrical smell, turn off your HVAC system at the breaker. These are safety emergencies. For other urgent HVAC issues like no heat in freezing weather or no AC in extreme heat, we do offer emergency service. What's your situation?";
      }

      // Maintenance / tune-up
      if (lowerMessage.includes("maintenance") || lowerMessage.includes("tune") || lowerMessage.includes("check") || lowerMessage.includes("inspection")) {
        return "Regular maintenance is key to keeping your system efficient and preventing breakdowns! We recommend a tune-up twice a year - once in spring for your AC and once in fall for your heating. A tune-up typically includes checking refrigerant levels, cleaning coils, inspecting electrical connections, and testing system performance. Would you like to schedule a maintenance visit?";
      }

      // Efficiency / energy bills
      if (lowerMessage.includes("efficien") || lowerMessage.includes("energy") || lowerMessage.includes("bill") || lowerMessage.includes("electric") || lowerMessage.includes("save money")) {
        return "There are several ways to improve HVAC efficiency! Regular filter changes, annual maintenance, sealing duct leaks, and upgrading to a programmable thermostat all help. If your system is 10-15+ years old, newer units with higher SEER ratings can cut cooling costs by 20-40%. The current minimum SEER rating is 14-15, but high-efficiency units go up to 20+. Want me to schedule an efficiency evaluation?";
      }

      // New system / replacement
      if (lowerMessage.includes("new system") || lowerMessage.includes("replace") || lowerMessage.includes("install") || lowerMessage.includes("upgrade") || lowerMessage.includes("new unit")) {
        return "Thinking about a new system? If your current unit is 10-15+ years old, frequently needs repairs, or your energy bills keep rising, it might be time. Modern systems are much more efficient - a new high-efficiency unit could reduce your energy bills significantly. We offer free in-home estimates and can discuss options including financing. Would you like to schedule a consultation?";
      }

      // Heat pump
      if (lowerMessage.includes("heat pump")) {
        return "Heat pumps are a great option! They provide both heating and cooling in one unit and are very energy efficient since they move heat rather than generate it. They work best in moderate climates, but newer models work well even in colder temperatures. If your heat pump is freezing up, short cycling, or not switching between heating and cooling modes, that typically indicates a refrigerant issue or a problem with the reversing valve.";
      }

      // Water leak from AC
      if (lowerMessage.includes("water") && (lowerMessage.includes("leak") || lowerMessage.includes("drip") || lowerMessage.includes("puddle"))) {
        return "Water leaking from your AC is usually caused by a clogged condensate drain line - this is pretty common and can often be cleared. It could also be a frozen evaporator coil that's melting, or a cracked drain pan. Turn off your system to prevent water damage, and we can send a technician to fix it. Where is the water collecting - near your indoor unit or outside?";
      }
    }

    // General responses (work for any industry)
    if (lowerMessage.includes("service") || lowerMessage.includes("offer") || lowerMessage.includes("do you")) {
      return `We offer a wide range of services including ${client.services.slice(0, 3).join(", ")}, and more. Would you like me to tell you more about any specific service?`;
    }

    if (lowerMessage.includes("hour") || lowerMessage.includes("open") || lowerMessage.includes("available")) {
      return `Our business hours are ${client.hours?.weekday || "Monday-Friday 9AM-5PM"}. Weekend hours: ${client.hours?.weekend || "By appointment"}. Would you like to schedule an appointment?`;
    }

    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("quote") || lowerMessage.includes("estimate")) {
      return "I'd be happy to help you get a quote! To provide an accurate estimate, could you tell me more about what you're looking for?";
    }

    if (lowerMessage.includes("appointment") || lowerMessage.includes("schedule") || lowerMessage.includes("book")) {
      return "I can help you schedule an appointment! What day and time works best for you?";
    }

    if (lowerMessage.includes("location") || lowerMessage.includes("where") || lowerMessage.includes("area")) {
      return `We proudly serve ${client.service_area}. Is your location within our service area?`;
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("call")) {
      return "I can have someone from our team call you back. Would you like to leave your phone number?";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return `Hello! Thanks for reaching out. How can I help you today?`;
    }

    // Default with industry-specific flavor
    if (hvacClient) {
      return "I'd be happy to help with any HVAC questions! Whether it's about your AC, furnace, heat pump, air quality, or maintenance, I'm here to assist. What can I help you with today?";
    }

    return `Great question! Is there anything specific about our ${client.services[0] || "services"} I can help you with?`;
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
    <div className="min-h-screen bg-slate-950">
      {/* Demo Mode Header */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Lead Capture System Demo</span>
              <span className="text-white/60">|</span>
              <span className="text-sm text-white/80">{client.business_name}</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Demo Mode Toggle */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setDemoMode("chat")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    demoMode === "chat"
                      ? "bg-white text-brand-600"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chatbot
                </button>
                <button
                  onClick={() => setDemoMode("voice")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    demoMode === "voice"
                      ? "bg-white text-brand-600"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Voice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {demoMode === "chat" ? (
        /* Website Mockup with Floating Chat Widget */
        <div className="relative min-h-[calc(100vh-52px)] bg-white">
          {/* Fake Website Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-lg">{client.business_name}</h1>
                    <p className="text-xs text-gray-500">{client.industry}</p>
                  </div>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Services</a>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">About</a>
                  <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Contact</a>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    Get Quote
                  </button>
                </nav>
                <button className="md:hidden p-2">
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </header>

          {/* Fake Website Hero */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Trusted by 500+ customers in {client.service_area}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Professional {client.industry} Services You Can Trust
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Expert {client.services[0]?.toLowerCase() || "services"} and more.
                  Serving {client.service_area} with quality and reliability.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    Get Free Quote
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call Us Now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Fake Services Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Services</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {client.services.slice(0, 6).map((service, i) => (
                  <div key={i} className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{service}</h4>
                    <p className="text-sm text-gray-600">
                      Professional {service.toLowerCase()} services tailored to your needs.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Fake Contact Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Service Area</h4>
                    <p className="text-gray-600">{client.service_area}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                    <p className="text-gray-600">{client.hours?.weekday || "Mon-Fri 9AM-5PM"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Get In Touch</h4>
                    <p className="text-gray-600">24/7 AI Chat Support</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Floating Chat Widget */}
          <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isChatOpen && (
              <div className="absolute bottom-20 right-0 w-[380px] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-gray-200">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{client.business_name}</h3>
                        <p className="text-xs text-blue-100">Typically replies instantly</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        message.role === "assistant"
                          ? "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                          : "bg-blue-600 text-white rounded-br-md"
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border-0 text-gray-800 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Bubble Button */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
                isChatOpen
                  ? "bg-gray-800 rotate-0"
                  : "bg-gradient-to-br from-blue-600 to-blue-700 hover:scale-110"
              }`}
            >
              {isChatOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <>
                  <MessageSquare className="w-7 h-7 text-white" />
                  {hasNewMessage && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                      1
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Prompt tooltip */}
            {!isChatOpen && (
              <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg px-4 py-2 animate-bounce">
                <p className="text-sm text-gray-800 font-medium whitespace-nowrap">
                  Need help? Chat with us!
                </p>
                <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Voice Agent Demo */
        <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-slate-950 via-slate-925 to-slate-950 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                <Phone className="w-4 h-4" />
                Voice Agent Demo
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{client.business_name}</h1>
              <p className="text-slate-400">{client.service_area}</p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-emerald-600/20 rounded-3xl blur-2xl" />

              <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-2xl">
                {demoLink.demo_phone_number ? (
                  <div className="p-8 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <PhoneCall className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Call to Try It Live</h3>
                    <p className="text-slate-400 mb-6">
                      Dial now to speak with the AI voice agent
                    </p>
                    <a
                      href={`tel:${demoLink.demo_phone_number.replace(/\D/g, '')}`}
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-2xl hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                    >
                      <Phone className="w-7 h-7" />
                      {demoLink.demo_phone_number}
                    </a>

                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                      <p className="text-sm text-slate-500 mb-4">Voice Agent Features:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>24/7 Availability</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Natural Speech</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Lead Capture</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Appointment Booking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-slate-400">No phone number configured for this demo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Badge */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/50 text-xs text-slate-400">
          <Shield className="w-3 h-3" />
          <span>Private Demo</span>
        </div>
      </div>
    </div>
  );
}
