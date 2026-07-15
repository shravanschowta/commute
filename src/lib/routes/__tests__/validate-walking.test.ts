/**
 * Unit tests for validateWalkingDistance()
 *
 * Test matrix:
 *   200 m  → PASS
 *   800 m  → PASS
 *   999 m  → PASS
 *   1000 m → PASS  (exactly at the boundary — allowed)
 *   1001 m → FAIL  (one meter over — rejected)
 *   3000 m → FAIL
 *   10000 m → FAIL
 */

import { validateWalkingDistance } from "../validate-walking";
import type { CommuteRoute, TransportSegment } from "@/types/route";

let segId = 0;
function makeWalkSeg(distanceMeters: number): TransportSegment {
  return {
    id: `seg-${++segId}`,
    mode: "walk",
    from: { name: "A", lat: 12.97, lng: 77.59 },
    to: { name: "B", lat: 12.98, lng: 77.60 },
    durationMinutes: Math.ceil(distanceMeters / 80),
    distanceMeters,
    costInr: 0,
    instructions: "Walk",
  };
}

function makeMetroSeg(): TransportSegment {
  return {
    id: `seg-${++segId}`,
    mode: "metro",
    from: { name: "Station A", lat: 12.97, lng: 77.59 },
    to: { name: "Station B", lat: 12.98, lng: 77.60 },
    durationMinutes: 10,
    distanceMeters: 5000,
    costInr: 30,
    instructions: "Board metro",
  };
}

function makeRoute(walkSegs: TransportSegment[]): CommuteRoute {
  const segments = [walkSegs[0], makeMetroSeg(), ...(walkSegs.slice(1))];
  return {
    routeId: `route-test-${Date.now()}`,
    totalTimeMinutes: segments.reduce((s, x) => s + x.durationMinutes, 0),
    totalCostInr: 30,
    totalDistanceMeters: segments.reduce((s, x) => s + x.distanceMeters, 0),
    walkingDistanceMeters: walkSegs.reduce((s, x) => s + x.distanceMeters, 0),
    transportSegments: segments,
    eta: new Date().toISOString(),
    interchanges: 0,
    recommendationReason: "test",
    carbonSavedKg: 0,
    score: 0,
    preferenceTags: ["balanced"],
    badge: "Test",
  };
}

describe("validateWalkingDistance — single walk segment", () => {
  test("200 m → PASS", () => {
    const route = makeRoute([makeWalkSeg(200)]);
    expect(validateWalkingDistance(route).valid).toBe(true);
  });

  test("800 m → PASS", () => {
    const route = makeRoute([makeWalkSeg(800)]);
    expect(validateWalkingDistance(route).valid).toBe(true);
  });

  test("999 m → PASS", () => {
    const route = makeRoute([makeWalkSeg(999)]);
    expect(validateWalkingDistance(route).valid).toBe(true);
  });

  test("1000 m → PASS (boundary)", () => {
    const route = makeRoute([makeWalkSeg(1000)]);
    expect(validateWalkingDistance(route).valid).toBe(true);
  });

  test("1001 m → FAIL", () => {
    const route = makeRoute([makeWalkSeg(1001)]);
    const result = validateWalkingDistance(route);
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  test("3000 m → FAIL", () => {
    const route = makeRoute([makeWalkSeg(3000)]);
    expect(validateWalkingDistance(route).valid).toBe(false);
  });

  test("10000 m → FAIL", () => {
    const route = makeRoute([makeWalkSeg(10000)]);
    expect(validateWalkingDistance(route).valid).toBe(false);
  });
});

describe("validateWalkingDistance — two walk segments (start + end)", () => {
  test("500 m + 500 m = 1000 m total → PASS", () => {
    const route = makeRoute([makeWalkSeg(500), makeWalkSeg(500)]);
    expect(validateWalkingDistance(route).valid).toBe(true);
  });

  test("1000 m + 1000 m = 2000 m total → PASS (boundary)", () => {
    const route = makeRoute([makeWalkSeg(1000), makeWalkSeg(1000)]);
    expect(validateWalkingDistance(route).valid).toBe(true);
  });

  test("1000 m + 1001 m = 2001 m total → FAIL (total exceeds 2 km)", () => {
    const route = makeRoute([makeWalkSeg(1000), makeWalkSeg(1001)]);
    expect(validateWalkingDistance(route).valid).toBe(false);
  });

  test("500 m + 1001 m → FAIL (second leg exceeds 1 km)", () => {
    const route = makeRoute([makeWalkSeg(500), makeWalkSeg(1001)]);
    expect(validateWalkingDistance(route).valid).toBe(false);
  });
});

describe("validateWalkingDistance — Uber route (no walk segments)", () => {
  test("Uber-only route → always PASS", () => {
    const route: CommuteRoute = {
      routeId: "route-uber-test",
      totalTimeMinutes: 20,
      totalCostInr: 250,
      totalDistanceMeters: 15000,
      walkingDistanceMeters: 0,
      transportSegments: [
        {
          id: "seg-uber",
          mode: "uber",
          from: { name: "A", lat: 12.97, lng: 77.59 },
          to: { name: "B", lat: 12.98, lng: 77.60 },
          durationMinutes: 20,
          distanceMeters: 15000,
          costInr: 250,
          instructions: "Direct Uber ride",
        },
      ],
      eta: new Date().toISOString(),
      interchanges: 0,
      recommendationReason: "test",
      carbonSavedKg: 0,
      score: 0,
      preferenceTags: ["comfort"],
      badge: "Fastest",
    };
    expect(validateWalkingDistance(route).valid).toBe(true);
  });
});
