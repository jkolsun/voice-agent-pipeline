"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Mic2,
  Phone,
  Database,
  Calendar,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  link?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const PRODUCTION_CHECKLIST: ChecklistSection[] = [
  {
    id: "voice",
    title: "ElevenLabs Voice Setup",
    icon: <Mic2 className="w-5 h-5" />,
    items: [
      {
        id: "voice-1",
        label: "Create or select voice profile",
        description: "Choose or clone a voice that matches the brand",
        link: "https://elevenlabs.io/voice-lab",
      },
      { id: "voice-2", label: "Configure voice settings (stability, clarity)" },
      { id: "voice-3", label: "Test voice with sample phrases" },
      { id: "voice-4", label: "Client approves voice selection" },
      { id: "voice-5", label: "Document Voice ID in production config" },
    ],
  },
  {
    id: "phone",
    title: "Twilio Phone Setup",
    icon: <Phone className="w-5 h-5" />,
    items: [
      {
        id: "phone-1",
        label: "Purchase or port phone number",
        link: "https://console.twilio.com/us1/develop/phone-numbers",
      },
      { id: "phone-2", label: "Configure voice webhook URL" },
      { id: "phone-3", label: "Set up fallback number" },
      { id: "phone-4", label: "Test inbound call routing" },
      { id: "phone-5", label: "Verify call quality" },
    ],
  },
  {
    id: "crm",
    title: "CRM Integration",
    icon: <Database className="w-5 h-5" />,
    items: [
      { id: "crm-1", label: "Identify client's CRM system" },
      { id: "crm-2", label: "Obtain API credentials" },
      { id: "crm-3", label: "Map data fields (leads, contacts)" },
      { id: "crm-4", label: "Test lead creation" },
      { id: "crm-5", label: "Verify data sync both directions" },
    ],
  },
  {
    id: "calendar",
    title: "Calendar Integration",
    icon: <Calendar className="w-5 h-5" />,
    items: [
      { id: "cal-1", label: "Connect to client's calendar system" },
      { id: "cal-2", label: "Configure availability rules" },
      { id: "cal-3", label: "Set up booking notifications" },
      { id: "cal-4", label: "Test appointment creation" },
      { id: "cal-5", label: "Verify conflict detection" },
    ],
  },
  {
    id: "sms",
    title: "SMS/Email Follow-up",
    icon: <MessageSquare className="w-5 h-5" />,
    items: [
      { id: "sms-1", label: "Configure SMS sender ID" },
      { id: "sms-2", label: "Create message templates" },
      { id: "sms-3", label: "Set up email notifications" },
      { id: "sms-4", label: "Test delivery" },
      { id: "sms-5", label: "Verify opt-out handling" },
    ],
  },
];

export default function ProductionChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalItems = PRODUCTION_CHECKLIST.reduce(
    (acc, section) => acc + section.items.length,
    0
  );
  const completedItems = checkedItems.size;
  const progress = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Production Setup Progress
            </h3>
            <p className="text-sm text-slate-400">
              {completedItems} of {totalItems} tasks completed
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-brand-400">{progress}%</span>
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PRODUCTION_CHECKLIST.map((section) => {
          const sectionCompleted = section.items.filter((item) =>
            checkedItems.has(item.id)
          ).length;
          const sectionTotal = section.items.length;

          return (
            <div key={section.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">
                    {section.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {sectionCompleted} / {sectionTotal} complete
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {section.items.map((item) => {
                  const isChecked = checkedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-emerald-500/10"
                          : "bg-slate-800/50 hover:bg-slate-800"
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isChecked
                              ? "text-slate-400 line-through"
                              : "text-slate-200"
                          }`}
                        >
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
