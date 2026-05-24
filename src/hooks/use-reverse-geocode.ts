"use client";

import { useCallback } from "react";
import { reverseGeocode } from "@/lib/geo/nominatim";
import type { PlaceLocation } from "@/types/location";

export function useReverseGeocode() {
  const reverse = useCallback(
    async (lat: number, lng: number): Promise<PlaceLocation> => {
      return reverseGeocode(lat, lng);
    },
    [],
  );

  return { reverseGeocode: reverse };
}
