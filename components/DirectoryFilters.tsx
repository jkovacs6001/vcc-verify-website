"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

interface DirectoryFiltersProps {
  allLocations: string[];
  allRoles: string[];
  allSkills: string[];
  activeCount: number;
  query: string;
}

export function DirectoryFilters({
  allLocations,
  allRoles,
  allSkills,
  activeCount,
  query,
}: DirectoryFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = sp.get("location") ?? "";
  const role = sp.get("role") ?? "";
  const badge = sp.get("badge") ?? "";
  const skills = sp.getAll("skill");

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/directory?${params.toString()}`);
  }

  function toggleSkill(skill: string) {
    const params = new URLSearchParams(sp.toString());
    const current = params.getAll("skill");
    params.delete("skill");
    if (current.includes(skill)) {
      current.filter((s) => s !== skill).forEach((s) => params.append("skill", s));
    } else {
      [...current, skill].forEach((s) => params.append("skill", s));
    }
    router.replace(`/directory?${params.toString()}`);
  }

  function clearAll() {
    router.replace("/directory");
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/directory?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="rounded-2xl border border-blistBorder bg-black/40 p-4 space-y-4">
      {/* Search bar */}
      <input
        type="search"
        defaultValue={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by name, role, location, or bio…"
        className="w-full rounded-xl border border-blistBorder bg-black/60 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blistAccent"
      />

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">Filters</div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-blistTextMuted hover:text-white transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Location */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-blistTextMuted uppercase tracking-wide">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => update("location", e.target.value || null)}
            className="w-full rounded-xl border border-blistBorder bg-black/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blistAccent"
          >
            <option value="">All locations</option>
            {allLocations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-blistTextMuted uppercase tracking-wide">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => update("role", e.target.value || null)}
            className="w-full rounded-xl border border-blistBorder bg-black/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blistAccent"
          >
            <option value="">All roles</option>
            {allRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Badge */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-blistTextMuted uppercase tracking-wide">
            Badge
          </label>
          <select
            value={badge}
            onChange={(e) => update("badge", e.target.value || null)}
            className="w-full rounded-xl border border-blistBorder bg-black/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blistAccent"
          >
            <option value="">All badges</option>
            <option value="ELITE">⭐ Elite (85+)</option>
            <option value="TRUSTED">✦ Trusted (50+)</option>
            <option value="BASIC">✓ Basic</option>
          </select>
        </div>
      </div>

      {/* Skills multi-select */}
      {allSkills.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-blistTextMuted uppercase tracking-wide">
            Skills
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allSkills.map((s) => {
              const active = skills.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                    active
                      ? "bg-blistAccent/20 border-blistAccent text-white"
                      : "bg-white/5 border-blistBorder text-blistTextMuted hover:text-white hover:border-white/30"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
