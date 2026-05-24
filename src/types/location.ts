/** Resolved place from Google Places or geolocation */
export interface PlaceLocation {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export function placeLocationToQueryParam(place: PlaceLocation): string {
  return `${place.lat},${place.lng}`;
}

export function parsePlaceFromSearchParams(
  lat: string | null,
  lng: string | null,
  name: string | null,
  address: string | null,
  placeId: string | null,
): PlaceLocation | null {
  if (!lat || !lng || !name) return null;
  const latN = Number(lat);
  const lngN = Number(lng);
  if (Number.isNaN(latN) || Number.isNaN(lngN)) return null;
  return {
    placeId: placeId ?? `coord:${lat},${lng}`,
    name,
    address: address ?? name,
    lat: latN,
    lng: lngN,
  };
}
