"use client";

import { ClientDemo, ClientStatus, STATUS_LABELS } from "@/lib/types";
import ClientCard from "./ClientCard";
import { FileEdit, Eye, CheckCircle2, Rocket } from "lucide-react";

interface KanbanBoardProps {
  clients: ClientDemo[];
  selectedClient: ClientDemo | null;
  onSelectClient: (client: ClientDemo) => void;
  onApprove: (client: ClientDemo) => void;
  onPublish: (client: ClientDemo) => void;
  onPreview: (client: ClientDemo) => void;
  onDelete: (client: ClientDemo) => void;
}

const COLUMNS: ClientStatus[] = ["draft", "demo_ready", "approved", "production"];

const COLUMN_CONFIG: Record<ClientStatus, {
  icon: typeof FileEdit;
  gradient: string;
  iconBg: string;
  headerBorder: string;
  emptyText: string;
}> = {
  draft: {
    icon: FileEdit,
    gradient: "from-slate-500/20 to-slate-600/5",
    iconBg: "bg-slate-500",
    headerBorder: "border-slate-600/30",
    emptyText: "Create your first demo",
  },
  demo_ready: {
    icon: Eye,
    gradient: "from-amber-500/20 to-amber-600/5",
    iconBg: "bg-amber-500",
    headerBorder: "border-amber-500/30",
    emptyText: "Demos ready for review",
  },
  approved: {
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    iconBg: "bg-emerald-500",
    headerBorder: "border-emerald-500/30",
    emptyText: "Approved and ready to publish",
  },
  production: {
    icon: Rocket,
    gradient: "from-brand-500/20 to-brand-600/5",
    iconBg: "bg-brand-500",
    headerBorder: "border-brand-500/30",
    emptyText: "Live voice agents",
  },
};

export default function KanbanBoard({
  clients,
  selectedClient,
  onSelectClient,
  onApprove,
  onPublish,
  onPreview,
  onDelete,
}: KanbanBoardProps) {
  const getClientsByStatus = (status: ClientStatus) =>
    clients
      .filter((c) => c.status === status)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 h-full min-h-0">
      {COLUMNS.map((status, columnIndex) => {
        const columnClients = getClientsByStatus(status);
        const config = COLUMN_CONFIG[status];
        const Icon = config.icon;

        return (
          <div
            key={status}
            className="kanban-column flex flex-col min-h-[300px] animate-fade-in-up"
            style={{ animationDelay: `${columnIndex * 50}ms` }}
          >
            {/* Column Header */}
            <div className={`flex items-center gap-3 px-4 py-4 border-b ${config.headerBorder}`}>
              <div className={`w-8 h-8 rounded-lg ${config.iconBg} bg-opacity-20 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${config.iconBg.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-100 text-sm">
                  {STATUS_LABELS[status]}
                </h3>
              </div>
              <div className="flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                <span className="text-xs font-medium text-slate-300">
                  {columnClients.length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b ${config.gradient}`}>
              {columnClients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 px-4">
                  <div className={`w-12 h-12 rounded-xl ${config.iconBg} bg-opacity-10 flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500 text-center">
                    {config.emptyText}
                  </p>
                </div>
              ) : (
                columnClients.map((client, cardIndex) => (
                  <div
                    key={client.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${cardIndex * 30}ms` }}
                  >
                    <ClientCard
                      client={client}
                      isSelected={selectedClient?.id === client.id}
                      onSelect={onSelectClient}
                      onApprove={onApprove}
                      onPublish={onPublish}
                      onPreview={onPreview}
                      onDelete={onDelete}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
