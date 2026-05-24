import { BANGALORE_CENTER } from "@/lib/constants/bangalore";
import type { PlaceLocation } from "@/types/location";

type PhotonFeature = {
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: { coordinates: [number, number] };
};

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<PlaceLocation[]> {
  if (!query.trim() || query.length < 2) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("lat", String(BANGALORE_CENTER.lat));
  url.searchParams.set("lon", String(BANGALORE_CENTER.lng));
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) return [];

  const data = (await res.json()) as { features: PhotonFeature[] };

  return data.features
    .filter((f) => f.properties.country === "India" || !f.properties.country)
    .map((f) => {
      const [lng, lat] = f.geometry.coordinates;
      const name =
        f.properties.name ??
        f.properties.street ??
        "Unknown place";
      const address = [
        f.properties.street,
        f.properties.city ?? "Bengaluru",
        f.properties.state,
      ]
        .filter(Boolean)
        .join(", ");
      return {
        placeId: `osm:${f.properties.osm_id ?? `${lat},${lng}`}`,
        name,
        address: address || name,
        lat,
        lng,
      };
    });
}
