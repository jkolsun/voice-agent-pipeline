"use client";

import { useState } from "react";
import {
  ClientFormData,
  TransferRule,
  INDUSTRY_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/types";
import { Plus, Trash2, X } from "lucide-react";

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isEditing?: boolean;
}

const DEFAULT_FORM_DATA: ClientFormData = {
  business_name: "",
  industry: "",
  services: [],
  service_area: "",
  hours: {
    weekday: "9:00 AM - 5:00 PM",
    weekend: "Closed",
    timezone: "America/New_York",
  },
  after_hours_goal: "lead_capture",
  tone: "professional",
  transfer_rules: [],
};

export default function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Client Demo",
  isEditing = false,
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
    hours: { ...DEFAULT_FORM_DATA.hours, ...initialData?.hours },
  });

  const [newService, setNewService] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof ClientFormData>(
    field: K,
    value: ClientFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateHours = (field: keyof ClientFormData["hours"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      hours: { ...prev.hours, [field]: value },
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      updateField("services", [...formData.services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    updateField(
      "services",
      formData.services.filter((s) => s !== service)
    );
  };

  const addTransferRule = () => {
    updateField("transfer_rules", [
      ...formData.transfer_rules,
      { condition: "", action: "transfer", phone: "" },
    ]);
  };

  const updateTransferRule = (
    index: number,
    field: keyof TransferRule,
    value: string
  ) => {
    const updated = [...formData.transfer_rules];
    updated[index] = { ...updated[index], [field]: value };
    updateField("transfer_rules", updated);
  };

  const removeTransferRule = (index: number) => {
    updateField(
      "transfer_rules",
      formData.transfer_rules.filter((_, i) => i !== index)
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }
    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }
    if (formData.services.length === 0) {
      newErrors.services = "At least one service is required";
    }
    if (!formData.service_area.trim()) {
      newErrors.service_area = "Service area is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Information */}
      <section className="card">
        <h2 className="card-header flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">
            1
          </span>
          Business Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Business Name *</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              className={`input-field ${errors.business_name ? "border-red-500" : ""}`}
              placeholder="e.g., ABC Plumbing"
            />
            {errors.business_name && (
              <p className="text-red-400 text-xs mt-1">{errors.business_name}</p>
            )}
          </div>

          <div>
            <label className="label">Industry *</label>
            <select
              value={formData.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              className={`select-field ${errors.industry ? "border-red-500" : ""}`}
            >
              <option value="">Select industry...</option>
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-red-400 text-xs mt-1">{errors.industry}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">Service Area *</label>
            <input
              type="text"
              value={formData.service_area}
              onChange={(e) => updateField("service_area", e.target.value)}
              className={`input-field ${errors.service_area ? "border-red-500" : ""}`}
              placeholder="e.g., Greater Los Angeles Area, Orange County"
            />
            {errors.service_area && (
              <p className="text-red-400 text-xs mt-1">{errors.service_area}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">Services Offered *</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addService();
                  }
                }}
                className="input-field flex-1"
                placeholder="Add a service and press Enter"
              />
              <button
                type="button"
                onClick={addService}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {errors.services && (
              <p className="text-red-400 text-xs mb-2">{errors.services}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 rounded-lg text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hours of Operation */}
      <section className="card">
        <h2 className="card-header flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">
            2
          </span>
          Hours of Operation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label">Weekday Hours</label>
            <input
              type="text"
              value={formData.hours.weekday}
              onChange={(e) => updateHours("weekday", e.target.value)}
              className="input-field"
              placeholder="9:00 AM - 5:00 PM"
            />
          </div>

          <div>
            <label className="label">Weekend Hours</label>
            <input
              type="text"
              value={formData.hours.weekend}
              onChange={(e) => updateHours("weekend", e.target.value)}
              className="input-field"
              placeholder="Closed or hours"
            />
          </div>

          <div>
            <label className="label">Timezone</label>
            <select
              value={formData.hours.timezone}
              onChange={(e) => updateHours("timezone", e.target.value)}
              className="select-field"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("America/", "").replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Agent Behavior */}
      <section className="card">
        <h2 className="card-header flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">
            3
          </span>
          Agent Behavior
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">After-Hours Goal</label>
            <select
              value={formData.after_hours_goal}
              onChange={(e) =>
                updateField(
                  "after_hours_goal",
                  e.target.value as ClientFormData["after_hours_goal"]
                )
              }
              className="select-field"
            >
              <option value="lead_capture">Lead Capture</option>
              <option value="voicemail">Take Voicemail</option>
              <option value="emergency_transfer">Emergency Transfer</option>
            </select>
            <p className="text-xs text-slate-500 mt-1.5">
              {formData.after_hours_goal === "lead_capture" &&
                "Collect caller info for follow-up during business hours"}
              {formData.after_hours_goal === "voicemail" &&
                "Take detailed messages for the team to review"}
              {formData.after_hours_goal === "emergency_transfer" &&
                "Offer transfer option for urgent matters"}
            </p>
          </div>

          <div>
            <label className="label">Voice Tone</label>
            <select
              value={formData.tone}
              onChange={(e) =>
                updateField("tone", e.target.value as ClientFormData["tone"])
              }
              className="select-field"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
            </select>
            <p className="text-xs text-slate-500 mt-1.5">
              {formData.tone === "professional" &&
                "Clear, business-appropriate language"}
              {formData.tone === "friendly" &&
                "Warm and approachable, conversational"}
              {formData.tone === "casual" &&
                "Relaxed, neighborly approach"}
              {formData.tone === "formal" &&
                "Polished, elevated professionalism"}
            </p>
          </div>
        </div>
      </section>

      {/* Transfer Rules */}
      <section className="card">
        <h2 className="card-header flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">
            4
          </span>
          Transfer Rules
          <span className="text-xs font-normal text-slate-500 ml-2">
            (Optional)
          </span>
        </h2>

        <div className="space-y-4">
          {formData.transfer_rules.map((rule, index) => (
            <div
              key={index}
              className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-3"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="label">If caller says / mentions...</label>
                    <input
                      type="text"
                      value={rule.condition}
                      onChange={(e) =>
                        updateTransferRule(index, "condition", e.target.value)
                      }
                      className="input-field"
                      placeholder="e.g., emergency, water leak, gas smell"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Then...</label>
                      <select
                        value={rule.action}
                        onChange={(e) =>
                          updateTransferRule(index, "action", e.target.value)
                        }
                        className="select-field"
                      >
                        <option value="transfer">Transfer call</option>
                        <option value="urgent_flag">Flag as urgent</option>
                        <option value="custom_message">Custom message</option>
                      </select>
                    </div>
                    {rule.action === "transfer" && (
                      <div>
                        <label className="label">Transfer to...</label>
                        <input
                          type="text"
                          value={rule.phone || ""}
                          onChange={(e) =>
                            updateTransferRule(index, "phone", e.target.value)
                          }
                          className="input-field"
                          placeholder="Phone number"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTransferRule(index)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTransferRule}
            className="btn-secondary w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transfer Rule
          </button>
        </div>
      </section>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
