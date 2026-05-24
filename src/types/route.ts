export type TransportMode = "walk" | "metro" | "bus" | "uber" | "auto";

export type RoutePreference =
  | "cheapest"
  | "fastest"
  | "balanced"
  | "least_walking"
  | "comfort";

export type LngLat = [number, number];

export interface TransportSegment {
  id: string;
  mode: TransportMode;
  from: { name: string; lat: number; lng: number };
  to: { name: string; lat: number; lng: number };
  durationMinutes: number;
  distanceMeters: number;
  costInr: number;
  instructions: string;
  lineOrRoute?: string;
  /** GeoJSON-style coordinates [lng, lat] */
  geometry?: LngLat[];
}

export interface CommuteRoute {
  routeId: string;
  totalTimeMinutes: number;
  totalCostInr: number;
  totalDistanceMeters: number;
  walkingDistanceMeters: number;
  transportSegments: TransportSegment[];
  eta: string;
  interchanges: number;
  recommendationReason: string;
  carbonSavedKg: number;
  score: number;
  preferenceTags: RoutePreference[];
  badge?: string;
}

export interface RouteSearchRequest {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  preference: RoutePreference;
  departAt?: Date;
}

export interface RouteSearchResponse {
  routes: CommuteRoute[];
  searchedAt: string;
}
