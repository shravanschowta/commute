import type { PlaceLocation } from "@/types/location";

export interface SavedTrip {
  id: string;
  title: string;
  origin: PlaceLocation;
  destination: PlaceLocation;
  label?: "home" | "work" | "college" | "favorite" | "custom";
  lastUsedAt?: string;
  etaMinutes?: number;
  modes?: string[];
}

const KEY = "commuteblr:saved-trips";

const DEFAULT_TRIPS: SavedTrip[] = [
  {
    id: "daily-commute",
    title: "Home to Office",
    label: "work",
    origin: {
      placeId: "indiranagar",
      name: "Indiranagar",
      address: "Indiranagar, Bengaluru",
      lat: 12.9784,
      lng: 77.6408,
    },
    destination: {
      placeId: "bellandur",
      name: "Bellandur",
      address: "Bellandur, Bengaluru",
      lat: 12.926,
      lng: 77.6762,
    },
    etaMinutes: 34,
    modes: ["bus", "metro"],
    lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "weekend-mall",
    title: "Weekend Routine",
    label: "favorite",
    origin: {
      placeId: "whitefield",
      name: "Whitefield",
      address: "Whitefield, Bengaluru",
      lat: 12.9698,
      lng: 77.7499,
    },
    destination: {
      placeId: "phoenix",
      name: "Phoenix Marketcity",
      address: "Mahadevapura, Bengaluru",
      lat: 12.9972,
      lng: 77.6964,
    },
    etaMinutes: 48,
    modes: ["metro"],
    lastUsedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "airport",
    title: "Airport Express",
    label: "custom",
    origin: {
      placeId: "indiranagar",
      name: "Indiranagar",
      address: "Indiranagar, Bengaluru",
      lat: 12.9784,
      lng: 77.6408,
    },
    destination: {
      placeId: "kia",
      name: "Kempegowda Airport",
      address: "KIA, Bengaluru",
      lat: 13.1986,
      lng: 77.7066,
    },
    etaMinutes: 75,
    modes: ["bus"],
    lastUsedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export function loadSavedTrips(): SavedTrip[] {
  if (typeof window === "undefined") return DEFAULT_TRIPS;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_TRIPS));
    return DEFAULT_TRIPS;
  }
  try {
    return JSON.parse(raw) as SavedTrip[];
  } catch {
    return DEFAULT_TRIPS;
  }
}

export function saveSavedTrips(trips: SavedTrip[]): void {
  localStorage.setItem(KEY, JSON.stringify(trips));
}

export function addSavedTrip(trip: SavedTrip): void {
  const trips = loadSavedTrips();
  saveSavedTrips([trip, ...trips]);
}
