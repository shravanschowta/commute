import { z } from "zod";
import type { PlaceLocation } from "@/types/location";
import type { RoutePreference } from "@/types/route";

const preferenceSchema = z.enum([
  "cheapest",
  "fastest",
  "balanced",
  "least_walking",
  "comfort",
]);

export const routeSearchSchema = z
  .object({
    origin: z.custom<PlaceLocation>((v) => v != null),
    destination: z.custom<PlaceLocation>((v) => v != null),
    preference: preferenceSchema,
  })
  .refine(
    (data) => {
      const o = data.origin as PlaceLocation;
      const d = data.destination as PlaceLocation;
      const dist =
        Math.abs(o.lat - d.lat) + Math.abs(o.lng - d.lng);
      return dist > 0.0001 || o.placeId !== d.placeId;
    },
    { message: "Origin and destination must be different", path: ["destination"] },
  );

export type ValidatedRouteSearch = z.infer<typeof routeSearchSchema>;

export function validateRouteSearch(input: {
  origin: PlaceLocation | null;
  destination: PlaceLocation | null;
  preference: RoutePreference;
}) {
  return routeSearchSchema.safeParse(input);
}
