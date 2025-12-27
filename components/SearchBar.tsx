"use client";

import React from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  roleFilter: string;
}

const roles = [
  "All",
  "Developer",
  "Marketer",
  "Market Maker",
  "Moderator",
  "Web3 Worker",
];

export const SearchBar: React.FC<Props> = ({
  value,
  onChange,
  roleFilter,
  onRoleChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center">
      <div className="flex-1">
        <div className="rounded-2xl bg-vampSurfaceSoft border border-vampBorder px-4 py-2.5 flex items-center gap-2">
          <span className="text-vampTextMuted text-sm">🔍</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search by name, alias, wallet, or tag…"
            className="bg-transparent flex-1 outline-none text-sm placeholder:text-vampTextMuted text-vampTextMain"
          />
        </div>
      </div>
      <div className="w-full md:w-56">
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full bg-vampSurfaceSoft border border-vampBorder rounded-2xl px-3 py-2 text-sm cursor-paw-pointer outline-none text-vampTextMain placeholder:text-vampTextMuted focus:ring-2 focus:ring-vampAccent"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

