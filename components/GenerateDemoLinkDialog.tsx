"use client";

import { useState, useEffect } from "react";
import { ClientDemo, DemoLink } from "@/lib/types";
import { createDemoLink } from "@/lib/generators";
import { saveDemoLink, getDemoLinksForClient, deleteDemoLink } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Link2,
  Copy,
  Check,
  Clock,
  Trash2,
  ExternalLink,
  Shield,
  Plus,
  Phone,
} from "lucide-react";

interface GenerateDemoLinkDialogProps {
  client: ClientDemo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerateDemoLinkDialog({
  client,
  isOpen,
  onClose,
}: GenerateDemoLinkDialogProps) {
  const [existingLinks, setExistingLinks] = useState<DemoLink[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>("7");
  const [maxDuration, setMaxDuration] = useState<string>("120");
  const [demoPhoneNumber, setDemoPhoneNumber] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<DemoLink | null>(null);

  useEffect(() => {
    if (client && isOpen) {
      const links = getDemoLinksForClient(client.id);
      setExistingLinks(links.filter((l) => l.is_active));
      setNewLink(null);
      setShowCreateForm(links.length === 0);
    }
  }, [client, isOpen]);

  const handleCreateLink = () => {
    if (!client) return;

    const link = createDemoLink(client, {
      expiresInDays: expiresIn === "never" ? null : parseInt(expiresIn),
      maxDurationSeconds: parseInt(maxDuration),
      demoPhoneNumber: demoPhoneNumber.trim() || undefined,
    });

    saveDemoLink(link);
    setNewLink(link);
    setExistingLinks((prev) => [...prev, link]);
    setShowCreateForm(false);
    setDemoPhoneNumber("");
  };

  const handleDeleteLink = (linkId: string) => {
    deleteDemoLink(linkId);
    setExistingLinks((prev) => prev.filter((l) => l.id !== linkId));
    if (newLink?.id === linkId) {
      setNewLink(null);
    }
  };

  const copyToClipboard = (link: DemoLink) => {
    const url = `${window.location.origin}/demo/${link.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return "Never expires";
    const date = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Link2 className="w-5 h-5 text-brand-400" />
            Demo Links
          </DialogTitle>
          <DialogDescription>
            Generate shareable demo links for {client.business_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Existing Links */}
          {existingLinks.length > 0 && !showCreateForm && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Active Links</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="text-brand-400 hover:text-brand-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Link
                </Button>
              </div>

              <div className="space-y-2">
                {existingLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-4 rounded-xl border ${
                      newLink?.id === link.id
                        ? "bg-brand-500/10 border-brand-500/30"
                        : "bg-slate-800/50 border-slate-700/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm text-brand-400 truncate">
                            /demo/{link.slug}
                          </code>
                          {newLink?.id === link.id && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-brand-500/20 text-brand-400">
                              New
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(link.max_duration_seconds / 60)} min limit
                          </span>
                          <span>{formatExpiry(link.expires_at)}</span>
                          <span>{link.usage_count} views</span>
                        </div>
                        {link.demo_phone_number && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">{link.demo_phone_number}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(link)}
                          className="h-8 w-8 text-slate-400 hover:text-white"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/demo/${link.slug}`, "_blank")}
                          className="h-8 w-8 text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New Link Form */}
          {(showCreateForm || existingLinks.length === 0) && (
            <div className="space-y-4">
              {existingLinks.length > 0 && (
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Create New Link</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-4">
                {/* Duration Limit */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Call Duration Limit</Label>
                  <Select value={maxDuration} onValueChange={setMaxDuration}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="180">3 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Demo will end after this time to protect your credits
                  </p>
                </div>

                {/* Link Expiration */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Link Expiration</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="never">Never expires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Demo Phone Number */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    Demo Phone Number
                    <span className="text-slate-600 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    type="tel"
                    value={demoPhoneNumber}
                    onChange={(e) => setDemoPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-slate-900/50 border-slate-700"
                  />
                  <p className="text-xs text-slate-500">
                    Add an ElevenLabs/Twilio number for clients to call directly
                  </p>
                </div>

                <Button
                  onClick={handleCreateLink}
                  className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Generate Demo Link
                </Button>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <p className="font-medium text-slate-300 mb-1">Demo Link Protections</p>
              <ul className="space-y-1 text-xs">
                <li>• Unique URL per client - not guessable</li>
                <li>• Time-limited calls to protect credits</li>
                <li>• Links not indexed by search engines</li>
                <li>• Optional expiration dates</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
