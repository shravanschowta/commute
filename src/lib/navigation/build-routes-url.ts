import type { PlaceLocation } from "@/types/location";
import type { RoutePreference } from "@/types/route";

export function buildRoutesSearchUrl(params: {
  origin: PlaceLocation;
  destination: PlaceLocation;
  preference: RoutePreference;
}): string {
  const q = new URLSearchParams({
    fromLat: String(params.origin.lat),
    fromLng: String(params.origin.lng),
    fromName: params.origin.name,
    fromAddress: params.origin.address,
    fromPlaceId: params.origin.placeId,
    toLat: String(params.destination.lat),
    toLng: String(params.destination.lng),
    toName: params.destination.name,
    toAddress: params.destination.address,
    toPlaceId: params.destination.placeId,
    preference: params.preference,
  });
  return `/routes?${q.toString()}`;
}
