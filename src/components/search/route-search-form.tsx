"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PreferenceChips } from "@/components/search/preference-chips";
import { LocationAutocomplete } from "@/components/search/location-autocomplete";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import { buildRoutesSearchUrl } from "@/lib/navigation/build-routes-url";
import { validateRouteSearch } from "@/lib/validation/route-search";
import type { PlaceLocation } from "@/types/location";
import type { RoutePreference } from "@/types/route";

const DEFAULT_ORIGIN: PlaceLocation = {
  placeId: "default-indiranagar",
  name: "Indiranagar",
  address: "Indiranagar, Bengaluru",
  lat: 12.9784,
  lng: 77.6408,
};

const DEFAULT_DEST: PlaceLocation = {
  placeId: "default-electronic-city",
  name: "Electronic City",
  address: "Electronic City, Bengaluru",
  lat: 12.8399,
  lng: 77.677,
};

export function RouteSearchForm() {
  const router = useRouter();
  const { reverseGeocode } = useReverseGeocode();
  const { loading: geoLoading, resolveCurrentPlace } = useGeolocation();

  const [origin, setOrigin] = useState<PlaceLocation | null>(DEFAULT_ORIGIN);
  const [destination, setDestination] = useState<PlaceLocation | null>(DEFAULT_DEST);
  const [originText, setOriginText] = useState(DEFAULT_ORIGIN.name);
  const [destText, setDestText] = useState(DEFAULT_DEST.name);
  const [preference, setPreference] = useState<RoutePreference>("cheapest");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const swapLocations = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
    setOriginText(destText);
    setDestText(originText);
    setFormError(null);
  }, [origin, destination, originText, destText]);

  const useCurrentLocation = useCallback(async () => {
    try {
      const place = await resolveCurrentPlace(reverseGeocode);
      setOrigin(place);
      setOriginText(place.name);
      setFormError(null);
    } catch {
      /* error surfaced in hook */
    }
  }, [resolveCurrentPlace, reverseGeocode]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const resolvedOrigin =
      origin ??
      (originText
        ? { ...DEFAULT_ORIGIN, name: originText, address: originText }
        : null);
    const resolvedDest =
      destination ??
      (destText
        ? { ...DEFAULT_DEST, name: destText, address: destText }
        : null);

    const result = validateRouteSearch({
      origin: resolvedOrigin,
      destination: resolvedDest,
      preference,
    });

    if (!result.success) {
      const msg = result.error.flatten().fieldErrors.destination?.[0]
        ?? result.error.flatten().fieldErrors.origin?.[0]
        ?? result.error.message;
      setFormError(msg);
      return;
    }

    if (!origin || !destination) {
      setFormError("Select both locations from the suggestions list.");
      return;
    }

    setSubmitting(true);
    router.push(
      buildRoutesSearchUrl({
        origin,
        destination,
        preference,
      }),
    );
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={onSubmit}
      className="glass-panel p-6 md:p-8 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-outline-variant/20"
    >
      <h1 className="text-2xl md:text-headline-lg font-bold text-primary mb-stack-md">
        Smarter Bangalore Commutes
      </h1>
      <p className="text-body-md text-on-surface-variant mb-stack-lg">
        Navigate the Silicon Valley of India with real-time metro updates and
        optimized multi-modal routes.
      </p>

      <div className="relative flex flex-col gap-2">
        <LocationAutocomplete
          label="Start location"
          placeholder="Start location"
          icon="my_location"
          iconClassName="text-primary"
          value={origin}
          displayValue={originText}
          onDisplayChange={setOriginText}
          onPlaceSelect={setOrigin}
          trailing={
            <button
              type="button"
              onClick={() => void useCurrentLocation()}
              disabled={geoLoading}
              className="absolute inset-y-0 right-3 flex items-center text-outline hover:text-primary transition-colors disabled:opacity-50"
              aria-label="Use current location"
            >
              <span className="material-symbols-outlined">
                {geoLoading ? "progress_activity" : "gps_fixed"}
              </span>
            </button>
          }
        />

        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <motion.button
            type="button"
            whileTap={{ rotate: 180, scale: 0.95 }}
            onClick={swapLocations}
            className="p-2 bg-primary text-on-primary rounded-full shadow-lg hover:scale-105 transition-transform"
            aria-label="Swap start and destination"
          >
            <span className="material-symbols-outlined text-lg">swap_vert</span>
          </motion.button>
        </div>

        <LocationAutocomplete
          label="Destination"
          placeholder="Where to?"
          icon="location_on"
          iconClassName="text-error"
          value={destination}
          displayValue={destText}
          onDisplayChange={setDestText}
          onPlaceSelect={setDestination}
        />
      </div>

      <PreferenceChips value={preference} onChange={setPreference} />

      {formError && (
        <p className="mt-4 text-sm text-error font-medium" role="alert">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full mt-stack-lg"
        disabled={submitting}
      >
        Plan My Route
        <span className="material-symbols-outlined">trending_flat</span>
      </Button>
    </motion.form>
  );
}
