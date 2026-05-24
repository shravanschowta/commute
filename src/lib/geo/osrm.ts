export type LngLat = [number, number];

export async function fetchWalkingRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<{ distanceMeters: number; durationMinutes: number; geometry: LngLat[] }> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM failed");
    const data = (await res.json()) as {
      routes?: Array<{
        distance: number;
        duration: number;
        geometry: { coordinates: LngLat[] };
      }>;
    };
    const route = data.routes?.[0];
    if (!route) throw new Error("No route");
    return {
      distanceMeters: Math.round(route.distance),
      durationMinutes: Math.max(1, Math.round(route.duration / 60)),
      geometry: route.geometry.coordinates,
    };
  } catch {
    const { haversineMeters, walkingMinutes } = await import("./haversine");
    const d = haversineMeters(from, to);
    return {
      distanceMeters: Math.round(d),
      durationMinutes: walkingMinutes(d),
      geometry: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
    };
  }
}
