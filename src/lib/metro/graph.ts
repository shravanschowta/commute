import stationsData from "../../../data/metro/stations.json";
import { haversineMeters } from "@/lib/geo/haversine";
import type { MetroLineId, MetroPath, MetroStation } from "@/lib/metro/types";

const MINUTES_PER_STATION = 2.5;
const BOARDING_MINUTES = 4;
const INTERCHANGE_MINUTES = 8;

function loadStations(): MetroStation[] {
  const out: MetroStation[] = [];
  for (const [line, config] of Object.entries(stationsData.lines)) {
    const lineId = line as MetroLineId;
    config.stations.forEach((s, index) => {
      const station = s as {
        id: string;
        name: string;
        lat: number;
        lng: number;
        interchange?: string[];
        linkedId?: string;
      };
      out.push({
        id: station.id,
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        line: lineId,
        index,
        interchange: station.interchange as MetroLineId[] | undefined,
        linkedId: station.linkedId,
      });
    });
  }
  return out;
}

export const ALL_METRO_STATIONS = loadStations();

const byId = new Map(ALL_METRO_STATIONS.map((s) => [s.id, s]));

export function findNearestStation(point: {
  lat: number;
  lng: number;
}): MetroStation {
  return ALL_METRO_STATIONS.reduce((best, s) => {
    const d = haversineMeters(point, s);
    const bestD = haversineMeters(point, best);
    return d < bestD ? s : best;
  });
}

function stationsOnLine(line: MetroLineId): MetroStation[] {
  return ALL_METRO_STATIONS.filter((s) => s.line === line).sort(
    (a, b) => a.index - b.index,
  );
}

function pathOnLine(from: MetroStation, to: MetroStation): MetroStation[] {
  const lineStations = stationsOnLine(from.line);
  const i1 = lineStations.findIndex((s) => s.id === from.id);
  const i2 = lineStations.findIndex((s) => s.id === to.id);
  if (i1 < 0 || i2 < 0) return [from, to];
  const [start, end] = i1 <= i2 ? [i1, i2] : [i2, i1];
  return lineStations.slice(start, end + 1);
}

function resolveLinked(station: MetroStation): MetroStation[] {
  const linked = station.linkedId ? byId.get(station.linkedId) : null;
  const reverse = ALL_METRO_STATIONS.find((s) => s.linkedId === station.id);
  const nodes = [station];
  if (linked) nodes.push(linked);
  if (reverse) nodes.push(reverse);
  return [...new Map(nodes.map((n) => [n.id, n])).values()];
}

/** Shortest metro path (same line or via Majestic interchange) */
export function findMetroPath(
  origin: MetroStation,
  destination: MetroStation,
): MetroPath {
  if (origin.line === destination.line) {
    const stations = pathOnLine(origin, destination);
    return {
      stations,
      line: origin.line,
      interchangeCount: 0,
    };
  }

  const originAccess = resolveLinked(origin);
  const destAccess = resolveLinked(destination);

  let best: MetroPath | null = null;

  for (const o of originAccess) {
    for (const d of destAccess) {
      if (o.line === d.line) {
        const stations = pathOnLine(o, d);
        const candidate: MetroPath = {
          stations,
          line: o.line,
          interchangeCount: o.id !== origin.id || d.id !== destination.id ? 1 : 0,
        };
        if (!best || candidate.stations.length < best.stations.length) {
          best = candidate;
        }
        continue;
      }

      const majesticPurple = byId.get("majestic")!;
      const majesticGreen = byId.get("majestic-green")!;

      const leg1 = pathOnLine(o, o.line === "purple" ? majesticPurple : majesticGreen);
      const leg2 = pathOnLine(
        d.line === "purple" ? majesticPurple : majesticGreen,
        d,
      );
      const stations = [...leg1, ...leg2.slice(1)];
      const candidate: MetroPath = {
        stations,
        line: o.line,
        interchangeCount: 1,
      };
      if (!best || stations.length < best.stations.length) best = candidate;
    }
  }

  return (
    best ?? {
      stations: [origin, destination],
      line: origin.line,
      interchangeCount: 1,
    }
  );
}

export function metroTravelMinutes(path: MetroPath): number {
  const stationCount = Math.max(0, path.stations.length - 1);
  return (
    BOARDING_MINUTES +
    stationCount * MINUTES_PER_STATION +
    path.interchangeCount * INTERCHANGE_MINUTES
  );
}

export function metroFareInr(path: MetroPath): number {
  const stationCount = Math.max(1, path.stations.length - 1);
  return Math.min(60, Math.max(10, 10 + stationCount * 4));
}

export function metroLineLabel(line: MetroLineId): string {
  return line === "purple" ? "PURPLE LINE" : "GREEN LINE";
}
