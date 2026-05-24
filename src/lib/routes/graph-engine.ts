import {
  busLegMinutes,
  findBestCorridor,
} from "@/lib/bmtc/graph";
import { haversineMeters, walkingMinutes } from "@/lib/geo/haversine";
import {
  findMetroPath,
  findNearestStation,
  metroFareInr,
  metroLineLabel,
  metroTravelMinutes,
} from "@/lib/metro/graph";
import type { MetroStation } from "@/lib/metro/types";
import { rankRoutes } from "@/lib/routes/scoring";
import type {
  CommuteRoute,
  RoutePreference,
  RouteSearchRequest,
  RouteSearchResponse,
  TransportSegment,
} from "@/types/route";
import type { RouteEngine } from "@/lib/routes/engine";

let segCounter = 0;
function nextSegId() {
  return `seg-${++segCounter}`;
}

function estimateUber(
  from: { lat: number; lng: number; name: string },
  to: { lat: number; lng: number; name: string },
): { minutes: number; cost: number; distance: number } {
  const distance = haversineMeters(from, to);
  const km = distance / 1000;
  const minutes = Math.max(12, Math.round((km / 22) * 60) + 5);
  const cost = Math.round(50 + km * 18);
  return { minutes, cost, distance: Math.round(distance) };
}

function walkSegment(
  from: { name: string; lat: number; lng: number },
  to: { name: string; lat: number; lng: number },
  label: string,
): TransportSegment {
  const distanceMeters = Math.round(haversineMeters(from, to));
  return {
    id: nextSegId(),
    mode: "walk",
    from,
    to,
    durationMinutes: walkingMinutes(distanceMeters),
    distanceMeters,
    costInr: 0,
    instructions: label,
    geometry: [
      [from.lng, from.lat],
      [to.lng, to.lat],
    ],
  };
}

async function buildMetroWalkRoute(
  origin: RouteSearchRequest["origin"],
  destination: RouteSearchRequest["destination"],
  badge: string,
  reason: string,
  tags: RoutePreference[],
): Promise<CommuteRoute> {
  const oStation = findNearestStation(origin);
  const dStation = findNearestStation(destination);
  const path = findMetroPath(oStation, dStation);

  const segments: TransportSegment[] = [];
  segments.push(
    walkSegment(
      { name: origin.name, lat: origin.lat, lng: origin.lng },
      { name: oStation.name, lat: oStation.lat, lng: oStation.lng },
      `Walk to ${oStation.name} Metro`,
    ),
  );

  const metroFrom = path.stations[0];
  const metroTo = path.stations[path.stations.length - 1];
  const metroDistance = path.stations.reduce((sum, s, i) => {
    if (i === 0) return 0;
    return sum + haversineMeters(path.stations[i - 1], s);
  }, 0);

  segments.push({
    id: nextSegId(),
    mode: "metro",
    from: { name: metroFrom.name, lat: metroFrom.lat, lng: metroFrom.lng },
    to: { name: metroTo.name, lat: metroTo.lat, lng: metroTo.lng },
    durationMinutes: metroTravelMinutes(path),
    distanceMeters: Math.round(metroDistance),
    costInr: metroFareInr(path),
    instructions: `Board ${metroLineLabel(path.line)} towards ${metroTo.name}`,
    lineOrRoute: metroLineLabel(path.line),
    geometry: path.stations.map((s) => [s.lng, s.lat] as [number, number]),
  });

  segments.push(
    walkSegment(
      { name: dStation.name, lat: dStation.lat, lng: dStation.lng },
      { name: destination.name, lat: destination.lat, lng: destination.lng },
      `Walk to ${destination.name}`,
    ),
  );

  return summarizeRoute(segments, badge, reason, tags, path.interchangeCount);
}

async function buildBusMetroWalk(
  origin: RouteSearchRequest["origin"],
  destination: RouteSearchRequest["destination"],
): Promise<CommuteRoute | null> {
  const corridorMatch = findBestCorridor(origin, destination);
  if (!corridorMatch) return null;

  const { corridor, fromStop, toStop } = corridorMatch;
  const metroAfterBus = findNearestStation(toStop);
  const dStation = findNearestStation(destination);
  const path = findMetroPath(metroAfterBus, dStation);

  const segments: TransportSegment[] = [];

  segments.push(
    walkSegment(
      { name: origin.name, lat: origin.lat, lng: origin.lng },
      { name: fromStop.name, lat: fromStop.lat, lng: fromStop.lng },
      `Walk to ${fromStop.name} bus stop`,
    ),
  );

  const busMinutes = busLegMinutes(corridor, fromStop, toStop);
  const busDistance = haversineMeters(fromStop, toStop);

  segments.push({
    id: nextSegId(),
    mode: "bus",
    from: { name: fromStop.name, lat: fromStop.lat, lng: fromStop.lng },
    to: { name: toStop.name, lat: toStop.lat, lng: toStop.lng },
    durationMinutes: busMinutes,
    distanceMeters: Math.round(busDistance),
    costInr: corridor.fareInr,
    instructions: `Board BMTC ${corridor.name}`,
    lineOrRoute: corridor.name,
    geometry: [
      [fromStop.lng, fromStop.lat],
      [toStop.lng, toStop.lat],
    ],
  });

  segments.push(
    walkSegment(
      { name: toStop.name, lat: toStop.lat, lng: toStop.lng },
      { name: metroAfterBus.name, lat: metroAfterBus.lat, lng: metroAfterBus.lng },
      `Walk to ${metroAfterBus.name} Metro`,
    ),
  );

  const metroFrom = path.stations[0];
  const metroTo = path.stations[path.stations.length - 1];
  segments.push({
    id: nextSegId(),
    mode: "metro",
    from: { name: metroFrom.name, lat: metroFrom.lat, lng: metroFrom.lng },
    to: { name: metroTo.name, lat: metroTo.lat, lng: metroTo.lng },
    durationMinutes: metroTravelMinutes(path),
    distanceMeters: Math.round(
      path.stations.reduce(
        (sum, s, i) =>
          i === 0 ? 0 : sum + haversineMeters(path.stations[i - 1], s),
        0,
      ),
    ),
    costInr: metroFareInr(path),
    instructions: `Metro ${metroLineLabel(path.line)} to ${metroTo.name}`,
    lineOrRoute: metroLineLabel(path.line),
    geometry: path.stations.map((s) => [s.lng, s.lat]),
  });

  segments.push(
    walkSegment(
      { name: dStation.name, lat: dStation.lat, lng: dStation.lng },
      { name: destination.name, lat: destination.lat, lng: destination.lng },
      `Walk to destination`,
    ),
  );

  return summarizeRoute(
    segments,
    "Multi-modal",
    "BMTC + Metro connection",
    ["cheapest", "balanced"],
    path.interchangeCount + 1,
  );
}

async function buildUberDirect(
  origin: RouteSearchRequest["origin"],
  destination: RouteSearchRequest["destination"],
): Promise<CommuteRoute> {
  const est = estimateUber(origin, destination);
  const segments: TransportSegment[] = [
    {
      id: nextSegId(),
      mode: "uber",
      from: { name: origin.name, lat: origin.lat, lng: origin.lng },
      to: {
        name: destination.name,
        lat: destination.lat,
        lng: destination.lng,
      },
      durationMinutes: est.minutes,
      distanceMeters: est.distance,
      costInr: est.cost,
      instructions: "Direct Uber ride",
      geometry: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
    },
  ];
  return summarizeRoute(
    segments,
    "Fastest",
    "Direct door-to-door ride",
    ["fastest", "comfort"],
    0,
  );
}

async function buildUberMetroWalk(
  origin: RouteSearchRequest["origin"],
  destination: RouteSearchRequest["destination"],
): Promise<CommuteRoute> {
  const oStation = findNearestStation(origin);
  const dStation = findNearestStation(destination);
  const path = findMetroPath(oStation, dStation);

  const uberLeg = estimateUber(origin, {
    lat: oStation.lat,
    lng: oStation.lng,
    name: oStation.name,
  });

  const segments: TransportSegment[] = [
    {
      id: nextSegId(),
      mode: "uber",
      from: { name: origin.name, lat: origin.lat, lng: origin.lng },
      to: { name: oStation.name, lat: oStation.lat, lng: oStation.lng },
      durationMinutes: uberLeg.minutes,
      distanceMeters: uberLeg.distance,
      costInr: Math.round(uberLeg.cost * 0.6),
      instructions: `Uber to ${oStation.name}`,
      geometry: [
        [origin.lng, origin.lat],
        [oStation.lng, oStation.lat],
      ],
    },
    {
      id: nextSegId(),
      mode: "metro",
      from: {
        name: path.stations[0].name,
        lat: path.stations[0].lat,
        lng: path.stations[0].lng,
      },
      to: {
        name: path.stations[path.stations.length - 1].name,
        lat: path.stations[path.stations.length - 1].lat,
        lng: path.stations[path.stations.length - 1].lng,
      },
      durationMinutes: metroTravelMinutes(path),
      distanceMeters: Math.round(
        path.stations.reduce(
          (sum, s, i) =>
            i === 0 ? 0 : sum + haversineMeters(path.stations[i - 1], s),
          0,
        ),
      ),
      costInr: metroFareInr(path),
      instructions: `Metro ${metroLineLabel(path.line)}`,
      lineOrRoute: metroLineLabel(path.line),
      geometry: path.stations.map((s) => [s.lng, s.lat]),
    },
    walkSegment(
      {
        name: dStation.name,
        lat: dStation.lat,
        lng: dStation.lng,
      },
      { name: destination.name, lat: destination.lat, lng: destination.lng },
      "Walk to destination",
    ),
  ];

  return summarizeRoute(
    segments,
    "Comfort",
    "Uber + Metro hybrid — less walking",
    ["comfort", "least_walking"],
    path.interchangeCount,
  );
}

async function buildBusOnly(
  origin: RouteSearchRequest["origin"],
  destination: RouteSearchRequest["destination"],
): Promise<CommuteRoute | null> {
  const match = findBestCorridor(origin, destination);
  if (!match) return null;
  const { corridor, fromStop, toStop } = match;

  const segments: TransportSegment[] = [
    walkSegment(
      { name: origin.name, lat: origin.lat, lng: origin.lng },
      { name: fromStop.name, lat: fromStop.lat, lng: fromStop.lng },
      "Walk to bus stop",
    ),
    {
      id: nextSegId(),
      mode: "bus",
      from: { name: fromStop.name, lat: fromStop.lat, lng: fromStop.lng },
      to: { name: toStop.name, lat: toStop.lat, lng: toStop.lng },
      durationMinutes: busLegMinutes(corridor, fromStop, toStop),
      distanceMeters: Math.round(haversineMeters(fromStop, toStop)),
      costInr: corridor.fareInr,
      instructions: `BMTC ${corridor.name} to near destination`,
      lineOrRoute: corridor.name,
      geometry: [
        [fromStop.lng, fromStop.lat],
        [toStop.lng, toStop.lat],
      ],
    },
    walkSegment(
      { name: toStop.name, lat: toStop.lat, lng: toStop.lng },
      { name: destination.name, lat: destination.lat, lng: destination.lng },
      "Walk to destination",
    ),
  ];

  return summarizeRoute(
    segments,
    "Budget",
    "Lowest cost BMTC corridor",
    ["cheapest"],
    0,
  );
}

function summarizeRoute(
  segments: TransportSegment[],
  badge: string,
  reason: string,
  tags: RoutePreference[],
  interchanges: number,
): CommuteRoute {
  const totalTimeMinutes = segments.reduce((s, x) => s + x.durationMinutes, 0);
  const totalCostInr = segments.reduce((s, x) => s + x.costInr, 0);
  const totalDistanceMeters = segments.reduce((s, x) => s + x.distanceMeters, 0);
  const walkingDistanceMeters = segments
    .filter((x) => x.mode === "walk")
    .reduce((s, x) => s + x.distanceMeters, 0);

  const carKm = totalDistanceMeters / 1000;
  const carbonSavedKg =
    segments.some((s) => s.mode === "uber")
      ? 0
      : Math.round(carKm * 0.12 * 10) / 10;

  return {
    routeId: `route-${crypto.randomUUID().slice(0, 8)}`,
    totalTimeMinutes,
    totalCostInr,
    totalDistanceMeters,
    walkingDistanceMeters,
    transportSegments: segments,
    eta: new Date(Date.now() + totalTimeMinutes * 60_000).toISOString(),
    interchanges,
    recommendationReason: reason,
    carbonSavedKg,
    score: 0,
    preferenceTags: tags,
    badge,
  };
}

export class GraphRouteEngine implements RouteEngine {
  async search(request: RouteSearchRequest): Promise<RouteSearchResponse> {
    segCounter = 0;
    const { origin, destination, preference } = request;

    const candidates: CommuteRoute[] = [];

    candidates.push(
      await buildMetroWalkRoute(
        origin,
        destination,
        "Best Value",
        "Walk → Metro → Walk",
        ["balanced", "cheapest"],
      ),
    );

    const busMetro = await buildBusMetroWalk(origin, destination);
    if (busMetro) candidates.push(busMetro);

    candidates.push(await buildUberDirect(origin, destination));
    candidates.push(await buildUberMetroWalk(origin, destination));

    const busOnly = await buildBusOnly(origin, destination);
    if (busOnly) candidates.push(busOnly);

    const walkHeavy = await buildMetroWalkRoute(
      origin,
      destination,
      "Eco",
      "Low-emission metro corridor",
      ["cheapest"],
    );
    walkHeavy.carbonSavedKg = Math.max(walkHeavy.carbonSavedKg, 1.5);
    candidates.push(walkHeavy);

    const unique = dedupeRoutes(candidates);
    const ranked = rankRoutes(unique, preference);

    ranked.forEach((r, i) => {
      r.routeId = `route-${i}-${r.routeId.split("-").pop()}`;
    });

    return { routes: ranked, searchedAt: new Date().toISOString() };
  }
}

function dedupeRoutes(routes: CommuteRoute[]): CommuteRoute[] {
  const seen = new Set<string>();
  return routes.filter((r) => {
    const key = r.transportSegments.map((s) => s.mode).join("-");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
