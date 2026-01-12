"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClientDemo, ClientStatus, STATUS_LABELS } from "@/lib/types";
import { getClients } from "@/lib/storage";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Search, Filter, ArrowRight } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientDemo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");

  useEffect(() => {
    setClients(getClients());
  }, []);

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        client.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.service_area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">All Clients</h1>
          <p className="text-slate-400 mt-1">
            {clients.length} total client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Client Demo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ClientStatus | "all")
            }
            className="select-field w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="demo_ready">Demo Ready</option>
            <option value="approved">Approved</option>
            <option value="production">Production</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 mb-2">No clients found</p>
          <p className="text-sm text-slate-500">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first client demo to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="card p-5 flex items-center justify-between hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">
                  {client.business_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors">
                      {client.business_name}
                    </h3>
                    <StatusBadge status={client.status} size="sm" />
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {client.industry} • {client.service_area}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Updated {new Date(client.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm text-slate-400">
                    {client.services.length} service
                    {client.services.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {client.transfer_rules.length} transfer rule
                    {client.transfer_rules.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
