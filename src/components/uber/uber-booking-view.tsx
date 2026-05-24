"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CommuteMap } from "@/components/map/commute-map";
import { haversineMeters } from "@/lib/geo/haversine";
import { buildUberDeepLink } from "@/lib/uber/deep-link";
import type { PlaceLocation } from "@/types/location";

const DEFAULT_ORIGIN: PlaceLocation = {
  placeId: "indiranagar",
  name: "Indiranagar",
  address: "Indiranagar, Bengaluru",
  lat: 12.9784,
  lng: 77.6408,
};

const DEFAULT_DEST: PlaceLocation = {
  placeId: "electronic-city",
  name: "Electronic City",
  address: "Electronic City, Bengaluru",
  lat: 12.8399,
  lng: 77.677,
};

export function UberBookingView({
  origin,
  destination,
}: {
  origin: PlaceLocation | null;
  destination: PlaceLocation | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const o = origin ?? DEFAULT_ORIGIN;
  const d = destination ?? DEFAULT_DEST;

  const km = haversineMeters(o, d) / 1000;
  const minFare = Math.round(50 + km * 16);
  const maxFare = Math.round(80 + km * 20);
  const minutes = Math.max(15, Math.round((km / 22) * 60) + 5);

  const book = () => {
    setLoading(true);
    const url = buildUberDeepLink({ pickup: o, dropoff: d });
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 glass-panel px-margin-mobile md:px-margin-desktop h-16 flex items-center border-b border-outline-variant/30">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-surface-container-high rounded-full"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 font-bold text-primary">Uber Booking</h1>
      </header>

      <main className="flex-grow pt-16 relative min-h-screen">
        <div className="absolute inset-0 opacity-40">
          <CommuteMap origin={o} destination={d} interactive={false} />
        </div>
        <div className="absolute inset-0 bg-on-background/10" />

        <div className="relative z-10 container mx-auto px-margin-mobile flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8">
          <div className="w-full max-w-[480px] bg-surface rounded-[32px] shadow-2xl overflow-hidden border border-outline-variant/50">
            <div className="uber-gradient p-8 flex flex-col items-center text-white relative">
              <div className="bg-white text-black font-extrabold text-3xl px-4 py-1 tracking-tighter">
                Uber
              </div>
              <span className="font-mono text-xs uppercase tracking-widest opacity-80 mt-2">
                via CommuteBLR
              </span>
            </div>

            <div className="p-8 space-y-8">
              <div className="relative pl-8 space-y-8">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-outline-variant/50" />
                <div className="relative">
                  <span className="absolute left-[-32px] top-0 w-4 h-4 rounded-full border-4 border-primary bg-surface z-10" />
                  <p className="font-mono text-xs text-on-surface-variant uppercase">
                    Pickup
                  </p>
                  <p className="font-bold text-lg">{o.name}</p>
                  <p className="text-sm text-on-surface-variant">{o.address}</p>
                </div>
                <div className="relative">
                  <span className="absolute left-[-32px] top-0 w-4 h-4 bg-secondary rounded-sm z-10" />
                  <p className="font-mono text-xs text-on-surface-variant uppercase">
                    Destination
                  </p>
                  <p className="font-bold text-lg">{d.name}</p>
                  <p className="text-sm text-on-surface-variant">{d.address}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-on-surface-variant text-sm">Estimated Fare</p>
                  <p className="text-xl font-bold">
                    ₹{minFare} – ₹{maxFare}
                  </p>
                </div>
                <span className="material-symbols-outlined text-outline">payments</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="glass-panel p-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">timer</span>
                  <div>
                    <p className="text-xs text-on-surface-variant">Est. time</p>
                    <p className="font-bold">{minutes} mins</p>
                  </div>
                </div>
                <div className="glass-panel p-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">traffic</span>
                  <div>
                    <p className="text-xs text-on-surface-variant">Distance</p>
                    <p className="font-bold">{km.toFixed(1)} km</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={book}
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
              >
                {loading ? "Opening Uber…" : "Book on Uber"}
                <span className="material-symbols-outlined">open_in_new</span>
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full text-on-surface-variant hover:text-primary font-medium py-2"
              >
                Return to Route Planner
              </button>
            </div>
          </div>
        </div>
      </main>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-on-background/80 flex items-center justify-center">
          <div className="bg-surface p-12 rounded-[40px] text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-lg">Redirecting to Uber…</h3>
          </div>
        </div>
      )}
    </div>
  );
}
