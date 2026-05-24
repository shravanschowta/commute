"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { BANGALORE_CENTER } from "@/lib/constants/bangalore";
import { MAP_STYLE_URL, MODE_COLORS } from "@/lib/map/style";
import type { CommuteRoute, LngLat } from "@/types/route";

type Props = {
  className?: string;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      if (!map.isStyleLoaded()) {
        map.once("load", draw);
        return;
      }

      const sources = ["route-segments", "route-points"];
      sources.forEach((id) => {
        if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`);
        if (map.getLayer(`${id}-circle`)) map.removeLayer(`${id}-circle`);
        if (map.getSource(id)) map.removeSource(id);
      });

      const allCoords: LngLat[] = [];

      if (route?.transportSegments.length) {
        const features = route.transportSegments
          .filter((s) => s.geometry && s.geometry.length >= 2)
          .map((s) => {
            allCoords.push(...(s.geometry ?? []));
            return {
              type: "Feature" as const,
              properties: { mode: s.mode, color: MODE_COLORS[s.mode] ?? "#003e7a" },
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
            "line-width": 5,
            "line-opacity": 0.85,
          },
        });
      }

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
              "#003e7a",
              "#ba1a1a",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });
      }

      if (allCoords.length >= 2) {
        const bounds = allCoords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new maplibregl.LngLatBounds(allCoords[0], allCoords[0]),
        );
        map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 800 });
      }
    };

    draw();
  }, [origin, destination, route]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[240px] ${className}`}
    />
  );
}
