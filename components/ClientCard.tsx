"use client";

import { ClientDemo } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { Pencil, CheckCircle, Rocket, MapPin, Play, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientCardProps {
  client: ClientDemo;
  isSelected?: boolean;
  onSelect: (client: ClientDemo) => void;
  onApprove: (client: ClientDemo) => void;
  onPublish: (client: ClientDemo) => void;
  onPreview: (client: ClientDemo) => void;
  onDelete: (client: ClientDemo) => void;
}

export default function ClientCard({
  client,
  isSelected,
  onSelect,
  onApprove,
  onPublish,
  onPreview,
  onDelete,
}: ClientCardProps) {
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={() => onSelect(client)}
      className={`client-card ${isSelected ? "client-card-selected" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate text-[15px] leading-tight">
            {client.business_name}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{client.industry}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={client.status} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(client);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate">{client.service_area}</span>
      </div>

      {/* Services preview */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {client.services.slice(0, 2).map((service, i) => (
          <Badge key={i} variant="secondary" className="text-xs bg-secondary/60 border-white/10">
            {service}
          </Badge>
        ))}
        {client.services.length > 2 && (
          <span className="px-2 py-1 text-xs text-muted-foreground">
            +{client.services.length - 2}
          </span>
        )}
      </div>

      {/* Actions based on status */}
      <div className="flex gap-2">
        {client.status === "draft" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => handleAction(e, () => onSelect(client))}
            className="flex-1 h-9 bg-secondary/60 border-white/10"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        )}

        {client.status === "demo_ready" && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => handleAction(e, () => onPreview(client))}
              className="h-9 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30"
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleAction(e, () => onApprove(client))}
              className="flex-1 h-9 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Approve
            </Button>
          </>
        )}

        {client.status === "approved" && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => handleAction(e, () => onPreview(client))}
              className="h-9 bg-secondary/60 border-white/10"
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleAction(e, () => onPublish(client))}
              className="flex-1 h-9 bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-500 hover:to-brand-400"
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              Publish
            </Button>
          </>
        )}

        {client.status === "production" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => handleAction(e, () => onPreview(client))}
            className="flex-1 h-9 bg-secondary/60 border-white/10"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Preview
          </Button>
        )}
      </div>
    </div>
  );
}
