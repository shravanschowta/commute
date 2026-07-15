"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CommuteMap } from "@/components/map/commute-map";
import { buildRouteDetailUrl } from "@/lib/navigation/build-route-detail-url";
import { saveRouteSearch } from "@/lib/storage/routes-cache";
import type { PlaceLocation } from "@/types/location";
import type { CommuteRoute, RoutePreference, RouteSearchResponse } from "@/types/route";
import { generateRouteExplanation } from "@/lib/routes/explanation";

const MODE_ICONS: Record<string, string> = {
  walk: "directions_walk",
  metro: "directions_subway",
  bus: "directions_bus",
  uber: "directions_car",
};

type Props = {
  origin: PlaceLocation | null;
  destination: PlaceLocation | null;
  preference: RoutePreference;
};

export function RoutesResultsView({
  origin,
  destination,
  preference,
}: Props) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "routes",
      origin?.lat,
      origin?.lng,
      destination?.lat,
      destination?.lng,
      preference,
    ],
    enabled: Boolean(origin && destination),
    queryFn: async (): Promise<RouteSearchResponse> => {
      const res = await fetch("/api/routes/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLat: origin!.lat,
          originLng: origin!.lng,
          originName: origin!.name,
          destLat: destination!.lat,
          destLng: destination!.lng,
          destName: destination!.name,
          preference,
        }),
      });
      if (!res.ok) throw new Error("Failed to load routes");
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.routes.length) {
      saveRouteSearch(data);
      setActiveId(data.routes[0].routeId);
    }
  }, [data]);

  if (!origin || !destination) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="glass-panel p-8 rounded-xl max-w-md text-center">
          <p className="text-on-surface-variant mb-4">
            Start a search from the home page to see route options.
          </p>
          <Link href="/" className="text-primary font-bold hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const activeRoute =
    data?.routes.find((r) => r.routeId === activeId) ?? data?.routes[0] ?? null;

  return (
    <main className="flex flex-col md:flex-row min-h-screen pt-0 md:pt-16 pb-20 md:pb-0">
      <aside className="w-full md:w-[400px] shrink-0 bg-surface border-r border-outline-variant/30 flex flex-col z-20 shadow-lg md:max-h-[calc(100vh-4rem)]">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant/20">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex flex-col items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-primary text-[18px]">
                radio_button_checked
              </span>
              <div className="w-0.5 h-6 bg-outline-variant" />
              <span className="material-symbols-outlined text-error text-[18px]">
                location_on
              </span>
            </div>
            <div className="grow">
              <p className="font-bold text-on-surface">{origin.name}</p>
              <p className="text-on-surface-variant mt-4">{destination.name}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="material-symbols-outlined p-2 hover:bg-surface-container-high rounded-full"
              aria-label="Swap search"
            >
              swap_vert
            </button>
          </div>
          <div className="flex items-center justify-between text-data-label font-mono text-on-surface-variant uppercase text-xs">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              Departing Now
            </span>
            <Link href="/" className="text-primary font-bold normal-case">
              Change
            </Link>
          </div>
        </div>

        {activeRoute && (() => {
          const exp = generateRouteExplanation(activeRoute);
          return (
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-surface-container-high/50 border border-outline-variant/30 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[18px]">assistant</span>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  COMMUTE EXPLANATION & INSIGHTS
                </p>
              </div>
              <p className="text-xs text-on-surface leading-relaxed font-sans font-medium">
                {exp.narrative}
              </p>
              
              <div className="flex flex-col gap-1.5 pl-1.5 border-l-2 border-primary/20 mt-1">
                {exp.steps.map((step, idx) => (
                  <div key={idx} className="text-[11px] text-on-surface-variant leading-normal flex gap-1 items-start">
                    <span className="font-mono font-bold text-primary shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {exp.insights.length > 0 && (
                <div className="flex flex-col gap-1 mt-1 border-t border-outline-variant/20 pt-2">
                  {exp.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-1 text-[10px] font-semibold text-secondary leading-tight">
                      <span className="material-symbols-outlined text-[12px] mt-0.5">check_circle</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <div className="grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {isLoading && (
            <p className="text-on-surface-variant animate-pulse">Finding 5 routes…</p>
          )}
          {error && (
            <p className="text-error">Could not load routes. Try again.</p>
          )}
          {!isLoading && !error && data && data.routes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
                directions_walk
              </span>
              <p className="font-bold text-on-surface">
                No suitable route found
              </p>
              <p className="text-sm text-on-surface-variant max-w-[280px]">
                No public transport route exists within the maximum walking
                distance (1 km) of your origin or destination. Try adjusting
                your start or end point.
              </p>
            </div>
          )}
          {data?.routes.map((route, index) => (
            <RouteCard
              key={route.routeId}
              route={route}
              active={route.routeId === activeId}
              onSelect={() => setActiveId(route.routeId)}
              origin={origin}
              destination={destination}
              isTop={index === 0}
            />
          ))}
        </div>
      </aside>

      <section className="relative grow min-h-[50vh] md:min-h-0 bg-surface-container overflow-hidden">
        <CommuteMap
          origin={origin}
          destination={destination}
          route={activeRoute}
          className="absolute inset-0"
        />
        <div className="absolute left-6 top-6 z-10">
          <div className="glass-panel px-4 py-2 rounded-full shadow-lg border border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">
              wb_sunny
            </span>
            <span className="font-mono text-data-label text-xs">28°C · Clear</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function RouteCard({
  route,
  active,
  onSelect,
  origin,
  destination,
  isTop,
}: {
  route: CommuteRoute;
  active: boolean;
  onSelect: () => void;
  origin: PlaceLocation;
  destination: PlaceLocation;
  isTop: boolean;
}) {
  const hasUber = route.transportSegments.some((s) => s.mode === "uber");
  const detailUrl = buildRouteDetailUrl(route.routeId, origin, destination);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={
        active
          ? "route-card-active rounded-xl border border-outline-variant/50 p-4 cursor-pointer"
          : "bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 cursor-pointer hover:shadow-md"
      }
    >
      <div className="flex justify-between items-start mb-2">
        {route.badge && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white ${
              isTop ? "bg-primary" : hasUber ? "bg-tertiary-container" : "bg-secondary"
            }`}
          >
            {route.badge}
          </span>
        )}
        <p className="font-bold text-primary ml-auto">{route.totalTimeMinutes} mins</p>
      </div>

      {/* Per-leg walk + transit breakdown */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4 text-xs font-mono text-on-surface-variant">
        {route.transportSegments.map((s) => {
          if (s.mode === "walk") {
            const meters = s.distanceMeters;
            const label =
              meters >= 1000
                ? `${(meters / 1000).toFixed(1)} km`
                : `${meters} m`;
            return (
              <span
                key={s.id}
                className="flex items-center gap-0.5 bg-surface-container px-1.5 py-0.5 rounded"
              >
                <span className="material-symbols-outlined text-[13px]">directions_walk</span>
                {label}
              </span>
            );
          }
          return (
            <span
              key={s.id}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                s.mode === "metro"
                  ? "bg-primary/10 text-primary"
                  : s.mode === "bus"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-tertiary-container/30 text-on-tertiary-container"
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {MODE_ICONS[s.mode]}
              </span>
              {s.lineOrRoute ?? s.mode}
            </span>
          );
        })}
        <div className="h-px grow bg-outline-variant mx-1" />
        <p className="font-bold">₹{route.totalCostInr}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-on-surface-variant mb-4">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">distance</span>
          {(route.walkingDistanceMeters / 1000).toFixed(1)} km walk
        </div>
        {route.carbonSavedKg > 0 && (
          <div className="flex items-center gap-1 text-secondary font-bold">
            <span className="material-symbols-outlined text-[14px]">eco</span>
            Save {route.carbonSavedKg}kg CO2
          </div>
        )}
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          href={detailUrl}
          className="grow py-2 px-4 rounded-lg bg-primary text-white font-bold text-center text-sm"
        >
          Open Route
        </Link>
        {hasUber ? (
          <Link
            href={`/uber?fromLat=${origin.lat}&fromLng=${origin.lng}&fromName=${encodeURIComponent(origin.name)}&toLat=${destination.lat}&toLng=${destination.lng}&toName=${encodeURIComponent(destination.name)}`}
            className="py-2 px-4 rounded-lg border border-primary text-primary font-bold text-sm"
          >
            Uber
          </Link>
        ) : (
          <Link
            href={detailUrl}
            className="py-2 px-4 rounded-lg border border-outline-variant text-on-surface-variant font-bold text-sm"
          >
            Details
          </Link>
        )}
      </div>
    </article>
  );
}
