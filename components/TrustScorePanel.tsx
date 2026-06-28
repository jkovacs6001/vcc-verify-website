interface ScoreBreakdownItem {
  label: string;
  points: number;
  earned: boolean;
}

interface TrustScorePanelProps {
  score: number;
  audits?: { delta: number; reason: string; createdAt: Date }[];
}

export function TrustScorePanel({ score, audits }: TrustScorePanelProps) {
  const tier =
    score >= 85 ? { label: "Elite", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" } :
    score >= 50 ? { label: "Trusted", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" } :
    score > 0   ? { label: "Basic", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" } :
                  { label: "Unscored", color: "text-blistTextMuted", bg: "bg-white/5 border-blistBorder" };

  const pct = Math.min(score, 100);

  return (
    <div className="rounded-2xl border border-blistBorder bg-black/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-blistTextMuted uppercase tracking-wide">Trust Score</div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tier.bg} ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      <div className="flex items-end gap-3">
        <div className={`text-5xl font-bold ${tier.color}`}>{score}</div>
        <div className="text-blistTextMuted text-sm mb-1">/ 100</div>
      </div>

      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blistAccent to-blistAccentSoft transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="text-xs text-blistTextMuted space-y-1">
        <div className="font-medium text-white/60 mb-2">Score breakdown</div>
        {[
          { label: "Approved member", pts: 20 },
          { label: "References (up to 3)", pts: 30 },
          { label: "Profile completeness", pts: 20 },
          { label: "Skills & tags", pts: 10 },
          { label: "Location listed", pts: 5 },
          { label: "Account age (up to 90d)", pts: 15 },
        ].map((item) => (
          <div key={item.label} className="flex justify-between">
            <span>{item.label}</span>
            <span className="text-blistTextMuted">up to {item.pts} pts</span>
          </div>
        ))}
      </div>

      {audits && audits.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-blistBorder">
          <div className="text-xs font-medium text-white/60 mb-2">Recent changes</div>
          {audits.slice(0, 5).map((a, i) => (
            <div key={i} className="flex justify-between text-xs text-blistTextMuted">
              <span>{a.reason}</span>
              <span className={a.delta >= 0 ? "text-green-400" : "text-red-400"}>
                {a.delta >= 0 ? "+" : ""}{a.delta}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
