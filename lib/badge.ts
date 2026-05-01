export type BadgeLevel = "BASIC" | "TRUSTED" | "ELITE" | null;

export function getBadgeFromScore(score: number, isApproved: boolean): BadgeLevel {
  if (!isApproved || score === 0) return null;
  if (score >= 85) return "ELITE";
  if (score >= 50) return "TRUSTED";
  return "BASIC";
}

export const BADGE_CONFIG = {
  ELITE: {
    label: "Elite",
    description: "Top-tier, community-validated professional",
    minScore: 85,
    color: "text-yellow-400",
    border: "border-yellow-400/40",
    bg: "bg-yellow-400/10",
    glow: "shadow-[0_0_8px_rgba(250,204,21,0.3)]",
    icon: "⭐",
  },
  TRUSTED: {
    label: "Trusted",
    description: "Strong on-chain history & references",
    minScore: 50,
    color: "text-blue-400",
    border: "border-blue-400/40",
    bg: "bg-blue-400/10",
    glow: "shadow-[0_0_8px_rgba(96,165,250,0.3)]",
    icon: "✦",
  },
  BASIC: {
    label: "Basic",
    description: "Verified VCC member",
    minScore: 1,
    color: "text-green-400",
    border: "border-green-400/40",
    bg: "bg-green-400/10",
    glow: "",
    icon: "✓",
  },
} as const;
