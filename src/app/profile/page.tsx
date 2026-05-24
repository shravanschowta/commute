"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  return (
    <main className="md:pt-16 pb-24 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-primary mb-2">Profile</h1>
      <p className="text-on-surface-variant mb-8">
        CommuteBLR uses free OpenStreetMap tiles and Photon search — no map API
        keys required.
      </p>

      <div className="glass-panel rounded-2xl p-6 border border-outline-variant/30 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <p className="font-bold text-lg">Guest Commuter</p>
            <p className="text-sm text-on-surface-variant">Bangalore, IN</p>
          </div>
        </div>

        <div className="border-t border-outline-variant/20 pt-4 space-y-3 text-sm">
          <Row label="Maps" value="MapLibre + OpenFreeMap (free)" />
          <Row label="Search" value="Photon / Nominatim (free)" />
          <Row label="Walking routes" value="OSRM public API" />
          <Row
            label="Cloud sync"
            value={supabaseReady ? "Supabase connected" : "Local storage only"}
          />
        </div>
      </div>

      <div className="mt-6 glass-panel rounded-2xl p-6 border border-secondary/20">
        <p className="font-mono text-xs text-secondary font-bold mb-2">PRO TIP</p>
        <p className="text-sm text-on-surface-variant">
          Pin your daily metro route to get traffic alerts. Add Supabase keys in
          .env.local to sync saved trips across devices.
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
