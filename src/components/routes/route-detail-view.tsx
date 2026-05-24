"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommuteMap } from "@/components/map/commute-map";
import { Button } from "@/components/ui/button";
import { findRouteById } from "@/lib/storage/routes-cache";
import { addSavedTrip } from "@/lib/storage/saved-trips";
import { buildUberDeepLink } from "@/lib/uber/deep-link";
import { MODE_COLORS } from "@/lib/map/style";
import type { PlaceLocation } from "@/types/location";
import type { CommuteRoute, TransportSegment } from "@/types/route";

const MODE_ICONS: Record<string, string> = {
  walk: "directions_walk",
  metro: "directions_subway",
  bus: "directions_bus",
  uber: "directions_car",
};

type Props = {
  routeId: string;
  origin: PlaceLocation | null;
  destination: PlaceLocation | null;
};

export function RouteDetailView({ routeId, origin, destination }: Props) {
  const router = useRouter();
  const [route, setRoute] = useState<CommuteRoute | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    setRoute(findRouteById(routeId));
  }, [routeId]);

  if (!route || !origin || !destination) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="glass-panel p-8 rounded-xl text-center max-w-md">
          <p className="text-on-surface-variant mb-4">
            Route not found. Search again from home.
          </p>
          <Link href="/" className="text-primary font-bold">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const hasUber = route.transportSegments.some((s) => s.mode === "uber");
  const cabCost = 450;

  const saveTrip = () => {
    addSavedTrip({
      id: `saved-${Date.now()}`,
      title: `${origin.name} → ${destination.name}`,
      origin,
      destination,
      label: "favorite",
      lastUsedAt: new Date().toISOString(),
      etaMinutes: route.totalTimeMinutes,
      modes: route.transportSegments.map((s) => s.mode),
    });
    alert("Trip saved to your hub!");
  };

  return (
    <main className="relative pt-0 md:pt-16 min-h-screen pb-24 md:pb-8">
      <section className="h-[45vh] md:h-[55vh] w-full relative">
        <CommuteMap
          origin={origin}
          destination={destination}
          route={route}
          className="absolute inset-0"
        />
        <button
          type="button"
          onClick={() => router.back()}
          className="md:hidden absolute top-4 left-4 z-20 w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary shadow-lg"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="absolute top-6 right-6 z-20">
          <div className="glass-panel px-4 py-3 rounded-xl border border-white/40 shadow-lg flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
            </span>
            <div>
              <p className="font-mono text-xs text-secondary uppercase">Live</p>
              <p className="font-bold text-primary">
                ETA {route.totalTimeMinutes} mins
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop relative z-10 -mt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
          <div
            className={`lg:col-span-8 bg-surface md:bg-transparent rounded-t-[32px] md:rounded-none p-6 md:p-0 border-t md:border-none border-outline-variant/30 ${
              sheetExpanded ? "md:translate-y-0" : ""
            }`}
          >
            <button
              type="button"
              className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-6 md:hidden"
              onClick={() => setSheetExpanded((v) => !v)}
              aria-label="Expand timeline"
            />
            <div className="md:glass-panel p-6 md:p-8 rounded-3xl border border-outline-variant/20 shadow-lg mb-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {origin.name} to {destination.name}
                  </h1>
                  <p className="text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      schedule
                    </span>
                    {route.totalTimeMinutes} mins total · {route.badge}
                  </p>
                </div>
                <div className="hidden md:flex gap-2">
                  <button
                    type="button"
                    onClick={saveTrip}
                    className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-primary hover:text-white"
                  >
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
              </div>

              <Timeline segments={route.transportSegments} />
            </div>

            <div className="flex gap-3 md:hidden">
              <Button className="flex-1" type="button">
                <span className="material-symbols-outlined">notifications_active</span>
                Reminder
              </Button>
              <button
                type="button"
                onClick={saveTrip}
                className="w-14 h-14 bg-surface-container-high text-primary flex items-center justify-center rounded-2xl"
              >
                <span className="material-symbols-outlined">bookmark</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-stack-lg">
            <MetricsCard route={route} cabCost={cabCost} />
            <div className="hidden md:block bg-primary p-6 rounded-3xl text-white shadow-lg">
              <h3 className="font-semibold mb-4">Set Departure Alert</h3>
              <p className="text-primary-fixed/80 text-sm mb-6">
                We&apos;ll notify you when it&apos;s optimal to leave based on live
                metro ETA.
              </p>
              <Button variant="outline" className="w-full bg-white text-primary border-0">
                <span className="material-symbols-outlined">alarm</span>
                Set Reminder
              </Button>
            </div>
            {route.carbonSavedKg > 0 && (
              <div className="bg-secondary-container/20 p-6 rounded-3xl border border-secondary/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-secondary">eco</span>
                  <h4 className="font-bold text-secondary">Eco-impact</h4>
                </div>
                <p className="text-on-secondary-container text-sm">
                  You prevent {route.carbonSavedKg}kg CO₂ vs a private car on this
                  trip.
                </p>
              </div>
            )}
            {hasUber && (
              <a
                href={buildUberDeepLink({ pickup: origin, dropoff: destination })}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-black text-white py-4 rounded-2xl font-bold"
              >
                Book on Uber →
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Timeline({ segments }: { segments: TransportSegment[] }) {
  return (
    <div className="space-y-0 relative">
      {segments.map((seg, i) => (
        <div key={seg.id} className="relative pl-10 pb-10 last:pb-0">
          {i < segments.length - 1 && (
            <div
              className={`absolute left-[7px] top-2 w-px h-full border-l ${
                seg.mode === "metro"
                  ? "border-primary bg-primary"
                  : "border-dashed border-outline-variant"
              }`}
            />
          )}
          <div
            className={`absolute left-0 top-1.5 flex items-center justify-center ${
              seg.mode === "metro"
                ? "left-[-4px] w-6 h-6 rounded-full bg-primary"
                : "w-4 h-4 rounded-full border-2 border-primary bg-surface"
            }`}
            style={
              seg.mode !== "metro"
                ? { borderColor: MODE_COLORS[seg.mode] }
                : undefined
            }
          >
            {seg.mode === "metro" ? (
              <span className="material-symbols-outlined text-white text-[16px]">
                {MODE_ICONS.metro}
              </span>
            ) : (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: MODE_COLORS[seg.mode] }}
              />
            )}
          </div>
          <div className="flex justify-between items-start gap-4">
            <div
              className={
                seg.mode === "metro"
                  ? "bg-primary/5 p-4 rounded-2xl border border-primary/10 grow"
                  : "grow"
              }
            >
              {seg.lineOrRoute && seg.mode === "metro" && (
                <span className="bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded mr-2">
                  {seg.lineOrRoute}
                </span>
              )}
              <p className="font-bold text-primary">{seg.instructions}</p>
              <p className="text-on-surface-variant text-sm mt-1">
                {seg.from.name} → {seg.to.name}
              </p>
            </div>
            <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded shrink-0">
              {seg.durationMinutes} mins
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricsCard({
  route,
  cabCost,
}: {
  route: CommuteRoute;
  cabCost: number;
}) {
  const saved = Math.max(0, cabCost - route.totalCostInr);
  return (
    <div className="glass-panel p-6 rounded-3xl border border-outline-variant/20 shadow-lg">
      <h3 className="font-mono text-xs text-outline uppercase tracking-widest mb-4">
        Trip Metrics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <p className="text-xs text-on-surface-variant mb-1">Total Cost</p>
          <p className="text-xl font-bold text-primary">₹{route.totalCostInr}</p>
          {saved > 0 && (
            <p className="text-[10px] text-secondary font-bold mt-1">
              SAVED ₹{saved} VS CAB
            </p>
          )}
        </div>
        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <p className="text-xs text-on-surface-variant mb-1">Total Time</p>
          <p className="text-xl font-bold text-primary">{route.totalTimeMinutes}m</p>
          <p className="text-[10px] text-on-surface-variant mt-1">
            {(route.walkingDistanceMeters / 1000).toFixed(1)}km walking
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-3 text-sm">
        {route.transportSegments.map((s) => (
          <div key={s.id} className="flex justify-between">
            <span className="text-on-surface-variant capitalize">{s.mode}</span>
            <span className="font-bold">
              {s.costInr === 0 ? (
                <span className="text-secondary">Free</span>
              ) : (
                `₹${s.costInr}`
              )}
            </span>
          </div>
        ))}
        <div className="h-px bg-outline-variant/30" />
        <div className="flex justify-between font-bold">
          <span>Total Payable</span>
          <span className="text-primary text-lg">₹{route.totalCostInr}</span>
        </div>
      </div>
    </div>
  );
}
