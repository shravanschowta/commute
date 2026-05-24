import { UberBookingView } from "@/components/uber/uber-booking-view";
import { parsePlaceFromSearchParams } from "@/types/location";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function UberPage({ searchParams }: PageProps) {
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

  return <UberBookingView origin={origin} destination={destination} />;
}
