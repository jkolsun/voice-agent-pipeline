"use client";

import { ClientStatus, STATUS_LABELS } from "@/lib/types";

interface StatusBadgeProps {
  status: ClientStatus;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<ClientStatus, {
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow?: string;
}> = {
  draft: {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
  },
  demo_ready: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  approved: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  production: {
    bg: "bg-brand-500/15",
    text: "text-brand-300",
    border: "border-brand-500/20",
    dot: "bg-brand-400",
    glow: "shadow-sm shadow-brand-500/20",
  },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`
        status-badge font-medium rounded-full border
        ${sizeClasses[size]}
        ${config.bg}
        ${config.text}
        ${config.border}
        ${config.glow || ""}
      `}
    >
      <span
        className={`${dotSizes[size]} rounded-full ${config.dot} ${status === "production" ? "animate-pulse" : ""}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
