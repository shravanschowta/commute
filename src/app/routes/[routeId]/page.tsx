import { RouteDetailView } from "@/components/routes/route-detail-view";
import { parsePlaceFromSearchParams } from "@/types/location";

type PageProps = {
  params: Promise<{ routeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function RouteDetailPage({ params, searchParams }: PageProps) {
  const { routeId } = await params;
  const sp = await searchParams;

  const origin = parsePlaceFromSearchParams(
    param(sp.fromLat),
    param(sp.fromLng),
    param(sp.fromName),
    param(sp.fromAddress),
    null,
  );
  const destination = parsePlaceFromSearchParams(
    param(sp.toLat),
    param(sp.toLng),
    param(sp.toName),
    param(sp.toAddress),
    null,
  );

  return (
    <RouteDetailView
      routeId={decodeURIComponent(routeId)}
      origin={origin}
      destination={destination}
    />
  );
}
