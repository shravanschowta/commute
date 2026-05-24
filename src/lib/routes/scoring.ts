import type { CommuteRoute, RoutePreference } from "@/types/route";

const WEIGHTS: Record<
  RoutePreference,
  { time: number; cost: number; walk: number; comfort: number }
> = {
  fastest: { time: 0.55, cost: 0.15, walk: 0.1, comfort: 0.2 },
  cheapest: { time: 0.2, cost: 0.5, walk: 0.15, comfort: 0.15 },
  least_walking: { time: 0.25, cost: 0.15, walk: 0.45, comfort: 0.15 },
  comfort: { time: 0.25, cost: 0.15, walk: 0.1, comfort: 0.5 },
  balanced: { time: 0.35, cost: 0.25, walk: 0.2, comfort: 0.2 },
};

export function scoreRoute(
  route: CommuteRoute,
  preference: RoutePreference,
  norms: { maxTime: number; maxCost: number; maxWalk: number },
): number {
  const w = WEIGHTS[preference];
  const timeNorm = route.totalTimeMinutes / norms.maxTime;
  const costNorm = route.totalCostInr / norms.maxCost;
  const walkNorm = route.walkingDistanceMeters / norms.maxWalk;
  const hasUber = route.transportSegments.some((s) => s.mode === "uber");
  const comfortNorm = hasUber ? 0.2 : route.interchanges > 0 ? 0.5 : 0.8;

  const penalty = 1 - (timeNorm * w.time + costNorm * w.cost + walkNorm * w.walk + comfortNorm * w.comfort);
  return Math.round(Math.max(0, Math.min(100, penalty * 100)));
}

export function rankRoutes(
  routes: CommuteRoute[],
  preference: RoutePreference,
): CommuteRoute[] {
  const maxTime = Math.max(...routes.map((r) => r.totalTimeMinutes), 1);
  const maxCost = Math.max(...routes.map((r) => r.totalCostInr), 1);
  const maxWalk = Math.max(...routes.map((r) => r.walkingDistanceMeters), 1);

  return [...routes]
    .map((r) => ({
      ...r,
      score: scoreRoute(r, preference, { maxTime, maxCost, maxWalk }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
