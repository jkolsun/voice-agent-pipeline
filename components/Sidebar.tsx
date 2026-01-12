"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ClientDemo, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { getClients } from "@/lib/storage";
import {
  Mic2,
  Plus,
  Home,
  Users,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  onClientChange?: () => void;
}

export default function Sidebar({ onClientChange }: SidebarProps) {
  const pathname = usePathname();
  const [clients, setClients] = useState<ClientDemo[]>([]);
  const [isClientsExpanded, setIsClientsExpanded] = useState(true);

  useEffect(() => {
    const loadClients = () => {
      const loaded = getClients();
      setClients(loaded.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    };
    
    loadClients();
    
    // Listen for storage changes
    const handleStorageChange = () => loadClients();
    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for internal updates
    window.addEventListener("clientsUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("clientsUpdated", handleStorageChange);
    };
  }, [onClientChange]);

  const groupedClients = {
    production: clients.filter((c) => c.status === "production"),
    approved: clients.filter((c) => c.status === "approved"),
    demo_ready: clients.filter((c) => c.status === "demo_ready"),
    draft: clients.filter((c) => c.status === "draft"),
  };

  return (
    <aside className="w-72 h-screen bg-slate-900 border-r border-slate-700/50 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm leading-tight">
              Voice Agent
            </h1>
            <p className="text-xs text-slate-500">Demo Builder</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Nav */}
        <div className="px-3 mb-6">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Clients Section */}
        <div className="px-3">
          <button
            onClick={() => setIsClientsExpanded(!isClientsExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Clients
            </span>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${
                isClientsExpanded ? "rotate-90" : ""
              }`}
            />
          </button>

          {isClientsExpanded && (
            <div className="mt-2 space-y-4">
              {/* New Client Button */}
              <Link
                href="/clients/new"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-400 hover:bg-brand-500/10 transition-colors border border-dashed border-brand-500/30 hover:border-brand-500/50"
              >
                <Plus className="w-4 h-4" />
                New Client Demo
              </Link>

              {/* Client Groups */}
              {(
                ["production", "approved", "demo_ready", "draft"] as const
              ).map((status) => {
                const statusClients = groupedClients[status];
                if (statusClients.length === 0) return null;

                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
                      />
                      <span className="text-xs font-medium text-slate-500">
                        {STATUS_LABELS[status]} ({statusClients.length})
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {statusClients.map((client) => (
                        <Link
                          key={client.id}
                          href={`/clients/${client.id}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === `/clients/${client.id}`
                              ? "bg-slate-800 text-slate-100"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                          }`}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {client.business_name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}

              {clients.length === 0 && (
                <p className="px-3 py-4 text-sm text-slate-500 text-center">
                  No clients yet
                </p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="px-3 py-2 rounded-lg bg-slate-800/50">
          <p className="text-xs text-slate-500">
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {groupedClients.production.length} in production
          </p>
        </div>
      </div>
    </aside>
  );
}
