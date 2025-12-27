"use client";

import React, { useMemo, useState } from "react";
import { MOCK_PROFESSIONALS, Professional } from "../lib/mockData";
import { SearchBar } from "./SearchBar";
import { ProfessionalCard } from "./ProfessionalCard";

export const DirectoryList: React.FC = () => {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    const lower = query.toLowerCase().trim();
    return MOCK_PROFESSIONALS.filter((p) => {
      const roleMatch =
        roleFilter === "All" ? true : p.role === roleFilter;

      if (!roleMatch) return false;
      if (!lower) return true;

      const haystack =
        `${p.name} ${p.alias ?? ""} ${p.wallet} ${p.tags.join(" ")}`
          .toLowerCase();

      return haystack.includes(lower);
    });
  }, [query, roleFilter]);

  return (
    <div className="space-y-5">
      <SearchBar
        value={query}
        onChange={setQuery}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
      />

      <p className="text-xs text-vampTextMuted mt-1">
        Showing {filtered.length} of {MOCK_PROFESSIONALS.length} professionals.
        This is a demo using mock data.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((p: Professional) => (
          <ProfessionalCard key={p.id} professional={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 text-center text-sm text-vampTextMuted border border-dashed border-vampBorder rounded-2xl py-10">
          No matches yet. Try another search or role.
        </div>
      )}
    </div>
  );
};

