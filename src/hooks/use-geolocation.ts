"use client";

import { useCallback, useState } from "react";
import type { PlaceLocation } from "@/types/location";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 30_000,
      });
    });
  }, []);

  const resolveCurrentPlace = useCallback(
    async (
      reverseGeocode: (lat: number, lng: number) => Promise<PlaceLocation>,
    ): Promise<PlaceLocation> => {
      setLoading(true);
      setError(null);
      try {
        const pos = await getCurrentPosition();
        const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        return place;
      } catch (e) {
        const message =
          e instanceof GeolocationPositionError
            ? e.code === 1
              ? "Location permission denied"
              : "Could not get your location"
            : e instanceof Error
              ? e.message
              : "Location error";
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [getCurrentPosition],
  );

  return { loading, error, resolveCurrentPlace, getCurrentPosition };
}
