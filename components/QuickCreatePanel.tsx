"use client";

import { useState } from "react";
import { Zap, ChevronDown, Globe, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import {
  INDUSTRY_OPTIONS,
  INDUSTRY_DEFAULTS,
  TIMEZONE_OPTIONS,
  ClientFormData,
} from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface QuickCreatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
}

export default function QuickCreatePanel({
  isOpen,
  onClose,
  onSubmit,
}: QuickCreatePanelProps) {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [scanError, setScanError] = useState("");
  const [websiteData, setWebsiteData] = useState<ClientFormData["website_data"]>(undefined);

  const [services, setServices] = useState<string[]>([]);
  const [tone, setTone] = useState<"professional" | "friendly" | "casual" | "formal">("professional");
  const [afterHoursGoal, setAfterHoursGoal] = useState<"lead_capture" | "voicemail" | "emergency_transfer">("lead_capture");
  const [hours, setHours] = useState({
    weekday: "9:00 AM - 5:00 PM",
    weekend: "Closed",
    timezone: "America/New_York",
  });

  const scanWebsite = async () => {
    if (!websiteUrl.trim()) return;

    setIsScanning(true);
    setScanStatus("idle");
    setScanError("");

    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to scan website");
      }

      const data = result.data;

      if (data.businessName && !businessName) {
        setBusinessName(data.businessName);
      }

      if (data.serviceArea && !serviceArea) {
        setServiceArea(data.serviceArea);
      }

      if (data.services && data.services.length > 0) {
        const existingServices = new Set(services);
        const newServices = data.services.filter((s: string) => !existingServices.has(s));
        if (newServices.length > 0) {
          setServices([...services, ...newServices].slice(0, 10));
        }
      }

      setWebsiteData({
        description: data.description,
        aboutUs: data.aboutUs,
        tagline: data.tagline,
        phone: data.phone,
        email: data.email,
        address: data.address,
        scrapedServices: data.services,
        rawContent: data.rawContent,
      });

      setScanStatus("success");
    } catch (error: any) {
      setScanError(error.message || "Failed to scan website");
      setScanStatus("error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleIndustryChange = (newIndustry: string) => {
    setIndustry(newIndustry);
    const defaults = INDUSTRY_DEFAULTS[newIndustry];
    if (defaults) {
      setServices(defaults.services || []);
      setTone(defaults.tone || "professional");
      setAfterHoursGoal(defaults.after_hours_goal || "lead_capture");
      if (defaults.hours) {
        setHours(defaults.hours);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim() || !industry || !serviceArea.trim()) {
      return;
    }

    const formData: ClientFormData = {
      business_name: businessName.trim(),
      industry,
      service_area: serviceArea.trim(),
      website_url: websiteUrl.trim() || undefined,
      website_data: websiteData,
      services: services.length > 0 ? services : INDUSTRY_DEFAULTS[industry]?.services || [],
      tone,
      after_hours_goal: afterHoursGoal,
      hours,
      transfer_rules: [],
    };

    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setBusinessName("");
    setIndustry("");
    setServiceArea("");
    setWebsiteUrl("");
    setWebsiteData(undefined);
    setScanStatus("idle");
    setScanError("");
    setServices([]);
    setTone("professional");
    setAfterHoursGoal("lead_capture");
    setHours({ weekday: "9:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" });
    setShowAdvanced(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isFormValid = businessName.trim() && industry && serviceArea.trim();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto slide-panel border-l border-white/10">
        <SheetHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl blur opacity-40" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold">Quick Create</SheetTitle>
              <SheetDescription>Build a demo in seconds</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Website URL Section */}
          <div className="rounded-xl border border-white/10 bg-secondary/30 p-4 space-y-3">
            <Label className="flex items-center gap-2 text-primary">
              <Globe className="w-4 h-4" />
              Company Website
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  setScanStatus("idle");
                }}
                placeholder="joesplumbing.com"
                className="flex-1 bg-background/50 border-white/10"
              />
              <Button
                type="button"
                onClick={scanWebsite}
                disabled={!websiteUrl.trim() || isScanning}
                variant={scanStatus === "success" ? "default" : "secondary"}
                className={scanStatus === "success" ? "bg-emerald-600 hover:bg-emerald-500" : ""}
              >
                {isScanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : scanStatus === "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
              </Button>
            </div>
            {scanStatus === "success" && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Website scanned! Data will enrich your demo.
              </p>
            )}
            {scanStatus === "error" && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {scanError}
              </p>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label>
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Joe's Plumbing"
              className="bg-background/50 border-white/10"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label>
              Industry <span className="text-destructive">*</span>
            </Label>
            <Select value={industry} onValueChange={handleIndustryChange}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {industry && INDUSTRY_DEFAULTS[industry] && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                Auto-filled {INDUSTRY_DEFAULTS[industry]?.services?.length || 0} services
              </p>
            )}
          </div>

          {/* Service Area */}
          <div className="space-y-2">
            <Label>
              Service Area <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="Austin, TX"
              className="bg-background/50 border-white/10"
            />
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
            <span>{showAdvanced ? "Hide" : "Show"} advanced options</span>
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <Separator />

              {/* Tone */}
              <div className="space-y-3">
                <Label>Agent Tone</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["professional", "friendly", "casual", "formal"] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant={tone === t ? "default" : "outline"}
                      onClick={() => setTone(t)}
                      className={`capitalize ${tone === t ? "bg-primary/20 border-primary text-primary" : "border-white/10"}`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              {/* After Hours Goal */}
              <div className="space-y-2">
                <Label>After Hours Behavior</Label>
                <Select value={afterHoursGoal} onValueChange={(v) => setAfterHoursGoal(v as any)}>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_capture">Capture Lead Info</SelectItem>
                    <SelectItem value="voicemail">Take Voicemail</SelectItem>
                    <SelectItem value="emergency_transfer">Emergency Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hours */}
              <div className="space-y-3">
                <Label>Business Hours</Label>
                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-muted-foreground w-20">Weekday</span>
                    <Input
                      type="text"
                      value={hours.weekday}
                      onChange={(e) => setHours({ ...hours, weekday: e.target.value })}
                      className="flex-1 bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-muted-foreground w-20">Weekend</span>
                    <Input
                      type="text"
                      value={hours.weekend}
                      onChange={(e) => setHours({ ...hours, weekend: e.target.value })}
                      className="flex-1 bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-xs text-muted-foreground w-20">Timezone</span>
                    <Select value={hours.timezone} onValueChange={(v) => setHours({ ...hours, timezone: v })}>
                      <SelectTrigger className="flex-1 bg-background/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz.replace("America/", "").replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Services Preview */}
              {services.length > 0 && (
                <div className="space-y-2">
                  <Label>Services (auto-filled)</Label>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, i) => (
                      <Badge key={i} variant="secondary" className="bg-secondary/60">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-600/25"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Demo
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Artifacts will be generated automatically
            </p>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
