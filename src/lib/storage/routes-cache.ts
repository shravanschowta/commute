import type { CommuteRoute, RouteSearchResponse } from "@/types/route";

const KEY = "commuteblr:last-search";

export function saveRouteSearch(payload: RouteSearchResponse): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(payload));
}

export function loadRouteSearch(): RouteSearchResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RouteSearchResponse;
  } catch {
    return null;
  }
}

export function findRouteById(routeId: string): CommuteRoute | null {
  const data = loadRouteSearch();
  return data?.routes.find((r) => r.routeId === routeId) ?? null;
}
