"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchPlaces } from "@/lib/geo/photon";
import { cn } from "@/lib/utils";
import type { PlaceLocation } from "@/types/location";

type Props = {
  label: string;
  placeholder: string;
  icon: string;
  iconClassName?: string;
  value: PlaceLocation | null;
  displayValue: string;
  onDisplayChange: (text: string) => void;
  onPlaceSelect: (place: PlaceLocation | null) => void;
  error?: string;
  trailing?: React.ReactNode;
};

export function LocationAutocomplete({
  label,
  placeholder,
  icon,
  iconClassName,
  value,
  displayValue,
  onDisplayChange,
  onPlaceSelect,
  error,
  trailing,
}: Props) {
  const id = useId();
  const [suggestions, setSuggestions] = useState<PlaceLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await searchPlaces(displayValue, controller.signal);
      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [displayValue]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative group">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <span className={cn("material-symbols-outlined text-xl", iconClassName)}>
          {icon}
        </span>
      </div>
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          onDisplayChange(e.target.value);
          if (!e.target.value) onPlaceSelect(null);
          setOpen(true);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={cn(
          "w-full pl-11 pr-12 py-4 bg-surface-container-lowest border-none rounded-lg text-body-md focus:ring-2 focus:ring-primary shadow-sm transition-all",
          error && "ring-2 ring-error",
        )}
      />
      {trailing}
      {loading && (
        <p className="mt-1 text-xs text-on-surface-variant">Searching…</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {value && !error && (
        <p className="mt-1 text-xs text-on-surface-variant truncate">
          {value.address}
        </p>
      )}
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-30 mt-1 w-full bg-surface-container-lowest rounded-lg border border-outline-variant/40 shadow-lg max-h-56 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((place) => (
            <li key={place.placeId} role="option">
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors"
                onClick={() => {
                  onDisplayChange(place.name);
                  onPlaceSelect(place);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-on-surface block">
                  {place.name}
                </span>
                <span className="text-xs text-on-surface-variant truncate block">
                  {place.address}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
