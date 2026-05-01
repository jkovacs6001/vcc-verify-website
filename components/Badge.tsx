import { BADGE_CONFIG, type BadgeLevel } from "@/lib/badge";

interface BadgeProps {
  level: BadgeLevel;
  size?: "sm" | "md" | "lg";
}

export function Badge({ level, size = "md" }: BadgeProps) {
  if (!level) return null;

  const cfg = BADGE_CONFIG[level];

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-0.5 gap-1",
    lg: "text-sm px-3 py-1 gap-1.5",
  }[size];

  return (
    <span
      title={cfg.description}
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${cfg.color} ${cfg.border} ${cfg.bg} ${cfg.glow}`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
