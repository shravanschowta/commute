import { NextResponse } from "next/server";
import { routeEngine } from "@/lib/routes/engine";
import type { RoutePreference } from "@/types/route";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      originLat,
      originLng,
      originName,
      destLat,
      destLng,
      destName,
      preference = "balanced",
    } = body as Record<string, unknown>;

    if (
      typeof originLat !== "number" ||
      typeof originLng !== "number" ||
      typeof destLat !== "number" ||
      typeof destLng !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 },
      );
    }

    const result = await routeEngine.search({
      origin: {
        lat: originLat,
        lng: originLng,
        name: String(originName ?? "Origin"),
      },
      destination: {
        lat: destLat,
        lng: destLng,
        name: String(destName ?? "Destination"),
      },
      preference: preference as RoutePreference,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Route search failed" },
      { status: 500 },
    );
  }
}
