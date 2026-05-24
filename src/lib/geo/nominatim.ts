import type { PlaceLocation } from "@/types/location";

const USER_AGENT = "CommuteBLR/1.0 (bangalore-transit-app)";

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<PlaceLocation> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    return {
      placeId: `coord:${lat},${lng}`,
      name: "Current location",
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
    };
  }

  const data = (await res.json()) as {
    place_id?: number;
    display_name?: string;
    address?: { suburb?: string; neighbourhood?: string; city?: string };
  };

  const name =
    data.address?.neighbourhood ??
    data.address?.suburb ??
    data.address?.city ??
    "Current location";

  return {
    placeId: `osm:${data.place_id ?? `${lat},${lng}`}`,
    name,
    address: data.display_name ?? name,
    lat,
    lng,
  };
}
