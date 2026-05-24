/** Build Uber web / app deep link with prefilled pickup & dropoff */
export function buildUberDeepLink(params: {
  pickup: { lat: number; lng: number; name?: string };
  dropoff: { lat: number; lng: number; name?: string };
}): string {
  const { pickup, dropoff } = params;
  const query = new URLSearchParams({
    pickup_latitude: String(pickup.lat),
    pickup_longitude: String(pickup.lng),
    dropoff_latitude: String(dropoff.lat),
    dropoff_longitude: String(dropoff.lng),
  });
  if (pickup.name) query.set("pickup_nickname", pickup.name);
  if (dropoff.name) query.set("dropoff_nickname", dropoff.name);
  return `https://m.uber.com/looking?${query.toString()}`;
}
