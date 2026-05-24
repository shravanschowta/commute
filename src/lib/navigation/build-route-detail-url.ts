import type { PlaceLocation } from "@/types/location";

export function buildRouteDetailUrl(
  routeId: string,
  origin: PlaceLocation,
  destination: PlaceLocation,
): string {
  const q = new URLSearchParams({
    fromLat: String(origin.lat),
    fromLng: String(origin.lng),
    fromName: origin.name,
    toLat: String(destination.lat),
    toLng: String(destination.lng),
    toName: destination.name,
  });
  return `/routes/${encodeURIComponent(routeId)}?${q.toString()}`;
}
