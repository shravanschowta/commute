import corridorsData from "../../../data/bmtc/corridors.json";
import { haversineMeters } from "@/lib/geo/haversine";
import { MAX_WALK_DISTANCE_METERS } from "@/lib/routes/walking-constants";

export interface BmtcStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface BmtcCorridor {
  id: string;
  name: string;
  stops: BmtcStop[];
  fareInr: number;
  avgSpeedKmh: number;
}

export const BMTC_CORRIDORS: BmtcCorridor[] = corridorsData.corridors;

export function findBestCorridor(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): { corridor: BmtcCorridor; fromStop: BmtcStop; toStop: BmtcStop } | null {
  let best: {
    corridor: BmtcCorridor;
    fromStop: BmtcStop;
    toStop: BmtcStop;
    score: number;
  } | null = null;

  for (const corridor of BMTC_CORRIDORS) {
    // Only consider stops within the 1 km walking radius of origin
    const nearOriginStops = corridor.stops.filter(
      (s) => haversineMeters(origin, s) <= MAX_WALK_DISTANCE_METERS,
    );
    // Only consider stops within the 1 km walking radius of destination
    const nearDestStops = corridor.stops.filter(
      (s) => haversineMeters(destination, s) <= MAX_WALK_DISTANCE_METERS,
    );

    if (nearOriginStops.length === 0 || nearDestStops.length === 0) continue;

    const fromStop = nearOriginStops.reduce((a, b) =>
      haversineMeters(origin, a) < haversineMeters(origin, b) ? a : b,
    );
    const toStop = nearDestStops.reduce((a, b) =>
      haversineMeters(destination, a) < haversineMeters(destination, b) ? a : b,
    );

    // Avoid degenerate routes where both endpoints map to the same stop
    if (fromStop.id === toStop.id) continue;

    const score =
      haversineMeters(origin, fromStop) + haversineMeters(destination, toStop);
    if (!best || score < best.score) {
      best = { corridor, fromStop, toStop, score };
    }
  }

  return best
    ? { corridor: best.corridor, fromStop: best.fromStop, toStop: best.toStop }
    : null;
}

export function busLegMinutes(
  corridor: BmtcCorridor,
  from: BmtcStop,
  to: BmtcStop,
): number {
  const d = haversineMeters(from, to);
  const hours = d / 1000 / corridor.avgSpeedKmh;
  return Math.max(15, Math.round(hours * 60) + 10);
}
