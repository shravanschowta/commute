"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { BANGALORE_CENTER } from "@/lib/constants/bangalore";
import { MAP_STYLE_URL, MODE_COLORS } from "@/lib/map/style";
import { haversineMeters, walkingMinutes } from "@/lib/geo/haversine";
import type { CommuteRoute, LngLat } from "@/types/route";

type Props = {
  className?: string;
  origin?: { lat: number; lng: number; name: string };
  destination?: { lat: number; lng: number; name: string };
  route?: CommuteRoute | null;
  interactive?: boolean;
};

export function CommuteMap({
  className = "",
  origin,
  destination,
  route,
  interactive = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // User location tracking / simulation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [BANGALORE_CENTER.lng, BANGALORE_CENTER.lat],
      zoom: 11,
      interactive,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Map click allows placing user location manually
    map.on("click", (e) => {
      // Avoid placing location if clicked on controls or markers
      setUserLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  // Find the first catch point (first bus stop or metro station)
  const getCatchPoint = () => {
    if (!route) return null;
    // Find the first non-walk transport segment
    const firstTransit = route.transportSegments.find(
      (s) => s.mode === "metro" || s.mode === "bus" || s.mode === "uber"
    );
    if (firstTransit) {
      return {
        lat: firstTransit.from.lat,
        lng: firstTransit.from.lng,
        name: firstTransit.from.name,
        mode: firstTransit.mode,
        lineOrRoute: firstTransit.lineOrRoute,
      };
    }
    // Fallback to route origin
    return route.transportSegments[0]
      ? {
          lat: route.transportSegments[0].from.lat,
          lng: route.transportSegments[0].from.lng,
          name: route.transportSegments[0].from.name,
          mode: "walk",
        }
      : null;
  };

  const catchPoint = getCatchPoint();

  // Reset user location when route changes
  useEffect(() => {
    setUserLocation(null);
    setIsSimulating(false);
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
  }, [route]);

  // Draw Layers (Route paths, markers, user location, connection lines)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      if (!map.isStyleLoaded()) {
        map.once("load", draw);
        return;
      }

      // Cleanup existing sources and layers
      const sourcesToClean = ["route-segments", "route-points", "user-location", "user-connection"];
      sourcesToClean.forEach((id) => {
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getLayer(`${id}-circle`)) map.removeLayer(`${id}-circle`);
        if (map.getLayer(`${id}-pulse`)) map.removeLayer(`${id}-pulse`);
        if (map.getLayer(`${id}-inner`)) map.removeLayer(`${id}-inner`);
        if (map.getSource(id)) map.removeSource(id);
      });

      const allCoords: LngLat[] = [];

      // 1. Draw main route segments
      if (route?.transportSegments.length) {
        const features = route.transportSegments
          .filter((s) => s.geometry && s.geometry.length >= 2)
          .map((s) => {
            allCoords.push(...(s.geometry ?? []));

            // CUSTOMIZATION: Highlight Purple and Green lines officially
            let color = MODE_COLORS[s.mode] ?? "#003e7a";
            if (s.mode === "metro" && s.lineOrRoute) {
              const label = s.lineOrRoute.toLowerCase();
              if (label.includes("purple")) {
                color = "#701d82"; // Purple line hex
              } else if (label.includes("green")) {
                color = "#008e3d"; // Green line hex
              }
            }

            return {
              type: "Feature" as const,
              properties: { mode: s.mode, color },
              geometry: {
                type: "LineString" as const,
                coordinates: s.geometry!,
              },
            };
          });

        map.addSource("route-segments", {
          type: "geojson",
          data: { type: "FeatureCollection", features },
        });

        map.addLayer({
          id: "route-segments-line",
          type: "line",
          source: "route-segments",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });
      }

      // 2. Draw origin and destination markers
      const points: GeoJSON.Feature[] = [];
      if (origin) {
        points.push({
          type: "Feature",
          properties: { type: "origin" },
          geometry: {
            type: "Point",
            coordinates: [origin.lng, origin.lat],
          },
        });
        allCoords.push([origin.lng, origin.lat]);
      }
      if (destination) {
        points.push({
          type: "Feature",
          properties: { type: "destination" },
          geometry: {
            type: "Point",
            coordinates: [destination.lng, destination.lat],
          },
        });
        allCoords.push([destination.lng, destination.lat]);
      }

      if (points.length) {
        map.addSource("route-points", {
          type: "geojson",
          data: { type: "FeatureCollection", features: points },
        });
        map.addLayer({
          id: "route-points-circle",
          type: "circle",
          source: "route-points",
          paint: {
            "circle-radius": 8,
            "circle-color": [
              "match",
              ["get", "type"],
              "origin",
              "#0055a4",
              "#ba1a1a",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });
      }

      // 3. Draw User Location if set
      if (userLocation) {
        map.addSource("user-location", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [userLocation.lng, userLocation.lat],
            },
            properties: {},
          },
        });

        // Pulsing radar circle style
        map.addLayer({
          id: "user-location-pulse",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 14,
            "circle-color": "#3b82f6",
            "circle-opacity": 0.4,
          },
        });

        map.addLayer({
          id: "user-location-inner",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 7,
            "circle-color": "#3b82f6",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // 4. Draw dynamic dashed line to first catch point
        if (catchPoint) {
          map.addSource("user-connection", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [userLocation.lng, userLocation.lat],
                  [catchPoint.lng, catchPoint.lat],
                ],
              },
              properties: {},
            },
          });

          map.addLayer({
            id: "user-connection-line",
            type: "line",
            source: "user-connection",
            paint: {
              "line-color": "#f97316", // Coral Orange
              "line-width": 4,
              "line-dasharray": [2, 2],
            },
          });
        }
      }

      // Auto fit bounds to contain route & user location
      const fitCoords = [...allCoords];
      if (userLocation) {
        fitCoords.push([userLocation.lng, userLocation.lat]);
      }

      if (fitCoords.length >= 2) {
        const bounds = fitCoords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new maplibregl.LngLatBounds(fitCoords[0], fitCoords[0])
        );
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
      }
    };

    draw();
  }, [origin, destination, route, userLocation, catchPoint?.lat, catchPoint?.lng]);

  // Geolocation trigger
  const trackMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        alert("Unable to retrieve location: " + err.message);
      }
    );
  };

  // Movement Simulation: Simulates walking towards the station/bus stop
  const startSimulation = () => {
    if (!catchPoint || !origin) return;
    setIsSimulating(true);

    // Start user at the origin point
    let currentLng = origin.lng;
    let currentLat = origin.lat;
    setUserLocation({ lat: currentLat, lng: currentLng });

    // Target stop coords
    const targetLng = catchPoint.lng;
    const targetLat = catchPoint.lat;

    const steps = 15;
    let stepCount = 0;

    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }

    simulationTimerRef.current = setInterval(() => {
      stepCount++;
      if (stepCount >= steps) {
        setUserLocation({ lat: targetLat, lng: targetLng });
        setIsSimulating(false);
        if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
        return;
      }

      // Linear interpolation for simple path animation
      const t = stepCount / steps;
      const interpolatedLat = currentLat + (targetLat - currentLat) * t;
      const interpolatedLng = currentLng + (targetLng - currentLng) * t;

      setUserLocation({ lat: interpolatedLat, lng: interpolatedLng });
    }, 900);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
  };

  // Calculations for connection HUD
  const distanceToCatch = userLocation && catchPoint
    ? Math.round(haversineMeters(userLocation, catchPoint))
    : 0;
  const minutesToCatch = walkingMinutes(distanceToCatch);

  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      {/* Map Element */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Action Controls */}
      <div className="absolute right-4 top-16 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={trackMyLocation}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-outline-variant/30 text-primary shadow-lg hover:bg-surface-container-high transition-colors"
          title="Use GPS Location"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>

        {catchPoint && (
          <button
            type="button"
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/30 shadow-lg transition-colors ${
              isSimulating
                ? "bg-error text-white hover:bg-error-container"
                : "bg-surface text-primary hover:bg-surface-container-high"
            }`}
            title={isSimulating ? "Stop Simulation" : "Simulate Journey"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSimulating ? "stop" : "navigation"}
            </span>
          </button>
        )}
      </div>

      {/* Navigation Connection HUD Card */}
      {userLocation && catchPoint && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
          <div className="glass-panel p-4 rounded-2xl shadow-xl border border-outline-variant/40 animate-fade-in flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                <p className="font-mono text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                  Live Navigation Link
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserLocation(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div>
              <p className="text-xs text-on-surface-variant">
                Walk connection to catch point:
              </p>
              <p className="font-bold text-sm text-primary truncate mt-0.5">
                {catchPoint.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-b border-outline-variant/20 py-2.5 my-1 bg-surface-container-lowest/50 px-2 rounded-xl">
              <div>
                <p className="text-[10px] text-on-surface-variant">Distance</p>
                <p className="font-bold text-orange-600 font-mono">
                  {distanceToCatch >= 1000
                    ? `${(distanceToCatch / 1000).toFixed(2)} km`
                    : `${distanceToCatch} meters`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant">Estimated Walk</p>
                <p className="font-bold text-orange-600 font-mono">
                  {minutesToCatch} mins
                </p>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-orange-500">info</span>
              <span>
                {isSimulating
                  ? "Simulating walk movement towards boarding stop..."
                  : "Drag the map or click to manually set/move your location marker."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
