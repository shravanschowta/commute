"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildRoutesSearchUrl } from "@/lib/navigation/build-routes-url";
import { loadSavedTrips, type SavedTrip } from "@/lib/storage/saved-trips";

export function SavedTripsView() {
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setTrips(loadSavedTrips());
  }, []);

  const filtered = trips.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.origin.name.toLowerCase().includes(query.toLowerCase()) ||
      t.destination.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <section className="mt-8 md:mt-12 mb-stack-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
          Your Bangalore Hub
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl">
          Saved paths and frequent destinations — plan again in one tap.
        </p>
      </section>

      <section className="mb-stack-lg">
        <div className="glass-panel border border-outline-variant/50 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-primary">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="material-symbols-outlined text-primary">search</span>
            <input
              className="w-full bg-transparent border-none focus:ring-0"
              placeholder="Where to next?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((trip) => (
          <article
            key={trip.id}
            className="glass-panel border border-outline-variant/40 rounded-[24px] overflow-hidden flex flex-col hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="h-28 bg-gradient-to-br from-primary/30 to-surface-container relative">
              <div className="absolute bottom-4 left-6">
                <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                  {trip.label ?? "Saved"}
                </span>
              </div>
              <span
                className="material-symbols-outlined absolute top-4 right-4 text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bookmark
              </span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{trip.title}</h3>
                  <p className="text-xs font-mono text-on-surface-variant flex items-center gap-1 mt-1">
                    {trip.origin.name}
                    <span className="material-symbols-outlined text-[14px]">
                      trending_flat
                    </span>
                    {trip.destination.name}
                  </p>
                </div>
                {trip.etaMinutes && (
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {trip.etaMinutes} min
                    </span>
                  </div>
                )}
              </div>
              {trip.modes && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  {trip.modes.map((m) => (
                    <span
                      key={m}
                      className="bg-secondary-container/30 px-3 py-1 rounded-full text-xs font-mono capitalize"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                <span className="text-xs text-on-surface-variant">
                  {trip.lastUsedAt
                    ? new Date(trip.lastUsedAt).toLocaleDateString()
                    : "—"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      buildRoutesSearchUrl({
                        origin: trip.origin,
                        destination: trip.destination,
                        preference: "balanced",
                      }),
                    )
                  }
                  className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95"
                >
                  Plan Now
                  <span className="material-symbols-outlined text-[18px]">
                    near_me
                  </span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-stack-lg flex flex-col md:flex-row gap-6">
        <div className="flex-1 glass-panel border border-primary/20 rounded-[28px] p-8">
          <h4 className="text-xl font-bold text-primary mb-2">Commute Efficiency</h4>
          <p className="text-on-surface-variant">
            You&apos;ve saved <span className="font-bold text-secondary">4.5 hours</span>{" "}
            this week using Metro-to-Bus connections.
          </p>
        </div>
        <div className="w-full md:w-80 glass-panel border border-secondary/20 rounded-[28px] p-8 text-center">
          <span className="text-5xl font-bold text-secondary leading-none">
            {trips.length}
          </span>
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mt-2 block">
            Saved Locations
          </span>
        </div>
      </section>

      <Link
        href="/"
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </>
  );
}
