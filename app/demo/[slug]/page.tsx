"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ClientDemo, DemoLink } from "@/lib/types";
import { getClient, getDemoLinkBySlug, incrementDemoLinkUsage, isDemoLinkValid } from "@/lib/storage";
import {
  AlertCircle,
  Phone,
  PhoneCall,
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
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

  // Check if client is in HVAC industry
  const isHVAC = (industry: string) => {
    const lower = industry.toLowerCase();
    return lower.includes("hvac") || lower.includes("heating") || lower.includes("cooling") || lower.includes("air condition");
  };

  // Check if client is in tree service industry
  const isTreeService = (industry: string) => {
    const lower = industry.toLowerCase();
    return lower.includes("tree") || lower.includes("pruning") || lower.includes("arborist");
  };

  // Simulated chat responses based on client data and industry expertise
  const getAIResponse = (userMessage: string): string => {
    if (!client) return "I'm here to help!";

    const lowerMessage = userMessage.toLowerCase();
    const hvacClient = isHVAC(client.industry);
    const treeClient = isTreeService(client.industry);

    // HVAC-specific responses
    if (hvacClient) {
      if ((lowerMessage.includes("ac") || lowerMessage.includes("air condition") || lowerMessage.includes("cooling")) &&
          (lowerMessage.includes("not") || lowerMessage.includes("isn't") || lowerMessage.includes("won't") || lowerMessage.includes("broken") || lowerMessage.includes("problem"))) {
        return "I'm sorry to hear your AC isn't cooling properly. This could be caused by several things - a dirty air filter, low refrigerant, a frozen evaporator coil, or issues with the compressor. A quick thing you can check is your air filter - if it's clogged, that's often the culprit. Would you like me to schedule a technician to diagnose the issue?";
      }

      if ((lowerMessage.includes("furnace") || lowerMessage.includes("heat") || lowerMessage.includes("warm")) &&
          (lowerMessage.includes("not") || lowerMessage.includes("isn't") || lowerMessage.includes("won't") || lowerMessage.includes("broken") || lowerMessage.includes("problem"))) {
        return "I understand - no heat is definitely uncomfortable! Common causes include thermostat issues, a tripped circuit breaker, a dirty filter restricting airflow, or pilot light/ignition problems. First, check that your thermostat is set to 'heat' and the temperature is set above room temp. Also check if the circuit breaker for your furnace has tripped. Would you like me to have a technician come take a look?";
      }

      if (lowerMessage.includes("noise") || lowerMessage.includes("sound") || lowerMessage.includes("loud") || lowerMessage.includes("clicking") || lowerMessage.includes("banging") || lowerMessage.includes("squealing") || lowerMessage.includes("grinding")) {
        return "Strange noises from your HVAC system can indicate different issues. Squealing often means a belt or motor issue, grinding suggests motor bearings may be failing, clicking could be an electrical problem, and banging might mean loose parts. If you're hearing a hissing sound, that could indicate a refrigerant leak. What type of noise are you hearing? I can have a technician diagnose it for you.";
      }

      if (lowerMessage.includes("refrigerant") || lowerMessage.includes("freon") || lowerMessage.includes("r22") || lowerMessage.includes("r410")) {
        return "Good question about refrigerant! If your system is low on refrigerant, it usually means there's a leak that needs to be found and repaired. R-22 (Freon) is being phased out, so if you have an older system using R-22, it may be more cost-effective to upgrade to a newer system using R-410A. Our technicians can evaluate your system and provide recommendations.";
      }

      if (lowerMessage.includes("filter")) {
        return "Great question! Air filters should be changed every 1-3 months, or monthly if you have pets or allergies. A dirty filter is actually the #1 cause of HVAC problems - it restricts airflow and makes your system work harder, increasing energy costs and wear. What size filter does your system use? I can help make sure you have the right one.";
      }

      if (lowerMessage.includes("thermostat")) {
        return "Thermostat issues can definitely affect your comfort! If it's not responding, check if it needs new batteries. If temperatures seem off, the thermostat might need recalibration, or it could be in a location that gets direct sunlight or drafts. We also install smart thermostats like Nest and Ecobee, which can save 10-15% on energy bills. Would you like more information?";
      }

      if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent") || lowerMessage.includes("gas smell") || lowerMessage.includes("carbon monoxide") || lowerMessage.includes("burning smell")) {
        return "If you smell gas, please leave your home immediately and call your gas company from outside. For carbon monoxide alarms, evacuate and call 911. If you're experiencing a burning electrical smell, turn off your HVAC system at the breaker. These are safety emergencies. For other urgent HVAC issues like no heat in freezing weather or no AC in extreme heat, we do offer emergency service. What's your situation?";
      }

      if (lowerMessage.includes("maintenance") || lowerMessage.includes("tune") || lowerMessage.includes("check") || lowerMessage.includes("inspection")) {
        return "Regular maintenance is key to keeping your system efficient and preventing breakdowns! We recommend a tune-up twice a year - once in spring for your AC and once in fall for your heating. A tune-up typically includes checking refrigerant levels, cleaning coils, inspecting electrical connections, and testing system performance. Would you like to schedule a maintenance visit?";
      }

      if (lowerMessage.includes("efficien") || lowerMessage.includes("energy") || lowerMessage.includes("bill") || lowerMessage.includes("electric") || lowerMessage.includes("save money")) {
        return "There are several ways to improve HVAC efficiency! Regular filter changes, annual maintenance, sealing duct leaks, and upgrading to a programmable thermostat all help. If your system is 10-15+ years old, newer units with higher SEER ratings can cut cooling costs by 20-40%. The current minimum SEER rating is 14-15, but high-efficiency units go up to 20+. Want me to schedule an efficiency evaluation?";
      }

      if (lowerMessage.includes("new system") || lowerMessage.includes("replace") || lowerMessage.includes("install") || lowerMessage.includes("upgrade") || lowerMessage.includes("new unit")) {
        return "Thinking about a new system? If your current unit is 10-15+ years old, frequently needs repairs, or your energy bills keep rising, it might be time. Modern systems are much more efficient - a new high-efficiency unit could reduce your energy bills significantly. We offer free in-home estimates and can discuss options including financing. Would you like to schedule a consultation?";
      }

      if (lowerMessage.includes("heat pump")) {
        return "Heat pumps are a great option! They provide both heating and cooling in one unit and are very energy efficient since they move heat rather than generate it. They work best in moderate climates, but newer models work well even in colder temperatures. If your heat pump is freezing up, short cycling, or not switching between heating and cooling modes, that typically indicates a refrigerant issue or a problem with the reversing valve.";
      }

      if (lowerMessage.includes("water") && (lowerMessage.includes("leak") || lowerMessage.includes("drip") || lowerMessage.includes("puddle"))) {
        return "Water leaking from your AC is usually caused by a clogged condensate drain line - this is pretty common and can often be cleared. It could also be a frozen evaporator coil that's melting, or a cracked drain pan. Turn off your system to prevent water damage, and we can send a technician to fix it. Where is the water collecting - near your indoor unit or outside?";
      }
    }

    // Tree service-specific responses
    if (treeClient) {
      // Tree removal
      if (lowerMessage.includes("remov") || lowerMessage.includes("take down") || lowerMessage.includes("cut down") || lowerMessage.includes("get rid of")) {
        return "I can help with tree removal! To give you an accurate estimate, we'd need to assess the tree in person. Factors that affect pricing include the tree's size, location (near structures or power lines), condition, and access for our equipment. We also offer stump grinding as an additional service. Would you like to schedule a free estimate?";
      }

      // Pruning/trimming
      if (lowerMessage.includes("prun") || lowerMessage.includes("trim") || lowerMessage.includes("cut back") || lowerMessage.includes("shape")) {
        return "We offer professional pruning services! Proper pruning improves tree health, appearance, and safety. We can do crown cleaning to remove dead branches, crown thinning for better light and airflow, or crown raising to clear structures and walkways. The best time for most pruning is late winter or early spring when trees are dormant. Would you like to schedule an estimate?";
      }

      // Dead tree / dead branches
      if (lowerMessage.includes("dead") || lowerMessage.includes("dying")) {
        return "Dead or dying trees and branches should definitely be addressed - they can be a safety hazard, especially during storms. Dead branches (we call them 'deadwood') can fall unexpectedly. If you have a dead tree, removal is usually recommended before it becomes unstable. We can come out and assess the situation. Is this an urgent safety concern or more of a routine matter?";
      }

      // Storm damage / emergency
      if (lowerMessage.includes("storm") || lowerMessage.includes("fell") || lowerMessage.includes("fallen") || lowerMessage.includes("emergency") || lowerMessage.includes("urgent") || lowerMessage.includes("down")) {
        return "For storm damage and emergencies, we offer 24/7 service. If a tree has fallen on your house, car, or is blocking your driveway, we can prioritize getting someone out quickly. If there are hanging branches that could fall, please keep a safe distance. Is anyone in immediate danger, or is the tree touching power lines? If so, please call 911 and your utility company first.";
      }

      // Stump grinding
      if (lowerMessage.includes("stump")) {
        return "Yes, we offer stump grinding! After a tree is removed, we can grind the stump down 6-12 inches below ground level. This allows you to plant grass, garden over the area, or even plant a new tree nearby. Stump grinding is usually priced separately from tree removal based on the stump diameter. Would you like to include this with a tree removal, or do you have an existing stump you need ground?";
      }

      // Disease / sick tree
      if (lowerMessage.includes("disease") || lowerMessage.includes("sick") || lowerMessage.includes("dying") || lowerMessage.includes("spots") || lowerMessage.includes("fungus") || lowerMessage.includes("mushroom")) {
        return "Tree diseases can be concerning! Common signs include discolored leaves, premature leaf drop, bark damage, or fungal growth. Mushrooms at the base often indicate root rot, which is serious. Some diseases can be treated if caught early, while others may require removal to prevent spread to nearby trees. Can you describe what you're seeing? Our arborist can assess it during a site visit.";
      }

      // Estimate / quote / price
      if (lowerMessage.includes("estimat") || lowerMessage.includes("quote") || lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
        return "We offer free on-site estimates! Tree work pricing depends on several factors: tree size and type, location (near structures, fences, or power lines), whether it's healthy or hazardous, access for equipment, and what you want done with the debris. Our estimator will assess everything and provide a detailed quote. Would you like to schedule an estimate?";
      }

      // When to prune / best time
      if (lowerMessage.includes("when") && (lowerMessage.includes("prune") || lowerMessage.includes("trim") || lowerMessage.includes("best time"))) {
        return "Great question! For most trees, late winter to early spring (while dormant) is the best time for pruning - it's easier to see the branch structure and causes less stress to the tree. However, dead or hazardous branches should be removed anytime for safety. Summer pruning is fine for minor corrective work. We generally avoid heavy pruning in fall. What type of tree are you looking to have pruned?";
      }

      // Branches over house / near structures
      if (lowerMessage.includes("house") || lowerMessage.includes("roof") || lowerMessage.includes("gutter") || lowerMessage.includes("power line") || lowerMessage.includes("structure")) {
        return "Branches overhanging your roof or near power lines are definitely worth addressing. They can damage shingles, clog gutters, and pose a risk during storms. We can do crown raising to provide clearance, or selectively remove branches that are too close to structures. For branches near power lines, we follow specific safety protocols. Would you like us to come take a look?";
      }

      // Leaning tree
      if (lowerMessage.includes("lean") || lowerMessage.includes("tilting")) {
        return "A leaning tree can be concerning, especially if it started leaning recently. Trees that have always leaned may be stable, but sudden leaning - particularly after a storm or heavy rain - could indicate root problems and potential failure. This is something we'd want to assess in person to determine if it's hazardous. Has this been a gradual lean or something more recent?";
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

    if (treeClient) {
      return "I'd be happy to help with your tree care needs! Whether you need pruning, tree removal, stump grinding, or have concerns about a tree's health, I'm here to assist. What can I help you with today?";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">{client.business_name}</h1>
                <p className="text-xs text-slate-400">AI Lead Capture Demo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Mode Selector - Big Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setDemoMode("chat")}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all ${
              demoMode === "chat"
                ? "border-brand-500 bg-brand-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                demoMode === "chat" ? "bg-brand-500" : "bg-slate-700"
              }`}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-lg ${demoMode === "chat" ? "text-brand-400" : "text-white"}`}>
                  Website Chatbot
                </h3>
                <p className="text-sm text-slate-400">Try the AI chat assistant</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setDemoMode("voice")}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all ${
              demoMode === "voice"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                demoMode === "voice" ? "bg-emerald-500" : "bg-slate-700"
              }`}>
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-lg ${demoMode === "voice" ? "text-emerald-400" : "text-white"}`}>
                  Voice Agent
                </h3>
                <p className="text-sm text-slate-400">Call the AI phone agent</p>
              </div>
            </div>
          </button>
        </div>

        {/* Demo Content */}
        {demoMode === "chat" ? (
          /* Chatbot Demo */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chat Window */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{client.business_name} AI</h3>
                    <p className="text-xs text-white/70">Online - Replies instantly</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.role === "assistant"
                        ? "bg-slate-800 text-white rounded-bl-md"
                        : "bg-brand-600 text-white rounded-br-md"
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
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
              <div className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Try These Prompts */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Try asking about:</h3>
                <div className="space-y-3">
                  {(isTreeService(client.industry) ? [
                    "I need a tree removed from my backyard",
                    "Can you trim the branches near my roof?",
                    "I have a dead tree that needs to come down",
                    "How much does stump grinding cost?",
                    "When is the best time to prune my trees?",
                    "A tree fell during the storm - can you help?",
                  ] : isHVAC(client.industry) ? [
                    "My AC isn't cooling properly",
                    "I need to schedule a maintenance visit",
                    "My furnace is making a strange noise",
                    "How often should I change my filter?",
                    "What services do you offer?",
                    "Do you have emergency service?",
                  ] : [
                    "What services do you offer?",
                    "I need to schedule an appointment",
                    "What areas do you serve?",
                    "What are your business hours?",
                    "Can I get a quote?",
                    "Do you have emergency service?",
                  ]).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputValue(prompt);
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all text-sm"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <h4 className="font-medium text-brand-400 mb-2">Chatbot Features</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span>24/7 instant responses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span>{isTreeService(client.industry) ? "Tree care expertise built-in" : isHVAC(client.industry) ? "HVAC expertise built-in" : "Industry expertise built-in"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span>Lead capture & scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span>Embeds on your website</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Voice Agent Demo */
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              {demoLink.demo_phone_number ? (
                <div className="p-10 text-center">
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <PhoneCall className="w-14 h-14 text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3">Call to Try the Voice Agent</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Dial the number below to speak with the AI voice agent. It will answer just like a real receptionist.
                  </p>

                  <a
                    href={`tel:${demoLink.demo_phone_number.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-3xl hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                  >
                    <Phone className="w-8 h-8" />
                    {demoLink.demo_phone_number}
                  </a>

                  <div className="mt-10 pt-8 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300">Natural conversation</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300">24/7 availability</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300">Captures lead info</span>
                      </div>
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300">Books appointments</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-700 flex items-center justify-center">
                    <Phone className="w-10 h-10 text-slate-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Voice Demo Not Configured</h2>
                  <p className="text-slate-400">
                    No phone number has been set up for this demo yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
