"use client";

import { useState, useEffect } from "react";
import { ClientDemo, ClientFormData } from "@/lib/types";
import { getClients, saveClient, deleteClient } from "@/lib/storage";
import {
  createQuickClient,
  approveClient,
  generateProductionArtifacts,
  publishToProduction,
} from "@/lib/generators";
import KanbanBoard from "@/components/KanbanBoard";
import QuickCreatePanel from "@/components/QuickCreatePanel";
import ClientDetailPanel from "@/components/ClientDetailPanel";
import PublishDialog from "@/components/PublishDialog";
import DemoPreview from "@/components/DemoPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Mic, Activity } from "lucide-react";

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientDemo[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDemo | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishingClient, setPublishingClient] = useState<ClientDemo | null>(null);
  const [showDemoPreview, setShowDemoPreview] = useState(false);
  const [previewClient, setPreviewClient] = useState<ClientDemo | null>(null);

  useEffect(() => {
    setClients(getClients());
  }, []);

  const refreshClients = () => {
    setClients(getClients());
    window.dispatchEvent(new Event("clientsUpdated"));
  };

  const handleQuickCreate = (formData: ClientFormData) => {
    const newClient = createQuickClient({
      business_name: formData.business_name,
      industry: formData.industry,
      service_area: formData.service_area,
    });

    const customizedClient: ClientDemo = {
      ...newClient,
      services: formData.services,
      tone: formData.tone,
      after_hours_goal: formData.after_hours_goal,
      hours: formData.hours,
      transfer_rules: formData.transfer_rules,
      website_url: formData.website_url,
      website_data: formData.website_data,
    };

    saveClient(customizedClient);
    refreshClients();
    setShowQuickCreate(false);
    setSelectedClient(customizedClient);
  };

  const handleSelectClient = (client: ClientDemo) => {
    setSelectedClient(client);
  };

  const handlePreview = (client: ClientDemo) => {
    setPreviewClient(client);
    setShowDemoPreview(true);
  };

  const handleApprove = (client: ClientDemo) => {
    const approved = approveClient(client);
    const withArtifacts = generateProductionArtifacts(approved);
    saveClient(withArtifacts);
    refreshClients();
    setSelectedClient(withArtifacts);
  };

  const handlePublishClick = (client: ClientDemo) => {
    setPublishingClient(client);
    setShowPublishDialog(true);
  };

  const handlePublish = (client: ClientDemo, voiceId: string, phoneNumber?: string) => {
    const published = publishToProduction(client, voiceId, phoneNumber);
    saveClient(published);
    refreshClients();
    setSelectedClient(published);
    setShowPublishDialog(false);
    setPublishingClient(null);
  };

  const handleCloseDetail = () => {
    setSelectedClient(null);
  };

  const handleDelete = (client: ClientDemo) => {
    if (confirm(`Delete "${client.business_name}"? This cannot be undone.`)) {
      deleteClient(client.id);
      refreshClients();
      if (selectedClient?.id === client.id) {
        setSelectedClient(null);
      }
    }
  };

  const statusCounts = {
    draft: clients.filter(c => c.status === "draft").length,
    demo_ready: clients.filter(c => c.status === "demo_ready").length,
    approved: clients.filter(c => c.status === "approved").length,
    production: clients.filter(c => c.status === "production").length,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="app-header sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 lg:px-8 py-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                <Mic className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Voice Agent Pipeline
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm text-muted-foreground">
                  {clients.length} client{clients.length !== 1 ? "s" : ""}
                </span>
                {statusCounts.production > 0 && (
                  <Badge variant="outline" className="gap-1.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    <Activity className="w-3 h-3" />
                    {statusCounts.production} live
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Create Button */}
          <Button
            onClick={() => setShowQuickCreate(true)}
            className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Create
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board */}
        <div
          className={`flex-1 overflow-hidden transition-all duration-300 ${
            selectedClient ? "pr-0" : ""
          }`}
        >
          <div className="h-full p-4 lg:p-6 overflow-auto">
            <KanbanBoard
              clients={clients}
              selectedClient={selectedClient}
              onSelectClient={handleSelectClient}
              onApprove={handleApprove}
              onPublish={handlePublishClick}
              onPreview={handlePreview}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Detail Panel */}
        {selectedClient && (
          <div className="w-[420px] flex-shrink-0 border-l border-border animate-in slide-in-from-right duration-300">
            <ClientDetailPanel
              client={selectedClient}
              onClose={handleCloseDetail}
              onApprove={handleApprove}
              onPublish={handlePublishClick}
              onPreview={handlePreview}
            />
          </div>
        )}
      </div>

      {/* Quick Create Panel */}
      <QuickCreatePanel
        isOpen={showQuickCreate}
        onClose={() => setShowQuickCreate(false)}
        onSubmit={handleQuickCreate}
      />

      {/* Publish Dialog */}
      <PublishDialog
        client={publishingClient}
        isOpen={showPublishDialog}
        onClose={() => {
          setShowPublishDialog(false);
          setPublishingClient(null);
        }}
        onPublish={handlePublish}
      />

      {/* Demo Preview */}
      <DemoPreview
        client={previewClient}
        isOpen={showDemoPreview}
        onClose={() => {
          setShowDemoPreview(false);
          setPreviewClient(null);
        }}
      />
    </div>
  );
}
