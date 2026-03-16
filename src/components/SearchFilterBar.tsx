import React from "react";
import { Search } from "lucide-react";

/** Consistent wrapper for search + filter + action bars. Use with SearchFilterBar.Search and SearchFilterBar.Select. */
export function SearchFilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

/** Search input with icon. Same height as selects/buttons (h-11). Min width 280px. */
export function SearchFilterBarSearch({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[280px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card"
      />
    </div>
  );
}

/** Filter select. Same height as search (h-11). Min width 140px. */
export function SearchFilterBarSelect({
  value,
  onChange,
  children,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <select
      className="h-11 px-4 rounded-lg border border-border bg-card min-w-[140px]"
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
    >
      {children}
    </select>
  );
}
