"use client";

import { cn } from "@/lib/utils";
import type { RoutePreference } from "@/types/route";

const OPTIONS: { id: RoutePreference; label: string }[] = [
  { id: "cheapest", label: "Cheapest" },
  { id: "fastest", label: "Fastest" },
  { id: "least_walking", label: "Least Walking" },
  { id: "comfort", label: "Comfort" },
];

type Props = {
  value: RoutePreference;
  onChange: (value: RoutePreference) => void;
};

export function PreferenceChips({ value, onChange }: Props) {
  return (
    <div className="mt-stack-lg overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full font-mono text-data-label uppercase tracking-wider border transition-colors",
                selected
                  ? "bg-secondary-container text-on-secondary-container border-secondary-fixed-dim/30"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-primary",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
