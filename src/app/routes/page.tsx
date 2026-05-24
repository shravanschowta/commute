import { RoutesResultsView } from "@/components/routes/routes-results-view";
import { parsePlaceFromSearchParams } from "@/types/location";
import type { RoutePreference } from "@/types/route";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function RoutesPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const origin = parsePlaceFromSearchParams(
    param(sp.fromLat),
    param(sp.fromLng),
    param(sp.fromName),
    param(sp.fromAddress),
    param(sp.fromPlaceId),
  );

  const destination = parsePlaceFromSearchParams(
    param(sp.toLat),
    param(sp.toLng),
    param(sp.toName),
    param(sp.toAddress),
    param(sp.toPlaceId),
  );

  const preference = (param(sp.preference) ?? "balanced") as RoutePreference;

  return (
    <RoutesResultsView
      origin={origin}
      destination={destination}
      preference={preference}
    />
  );
}
