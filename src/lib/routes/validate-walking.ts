import type { CommuteRoute } from "@/types/route";
import {
  MAX_WALK_DISTANCE_METERS,
  MAX_TOTAL_WALK_DISTANCE_METERS,
} from "@/lib/routes/walking-constants";

export interface WalkValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that a route satisfies the walking distance constraints:
 *   - Every individual walk segment must be ≤ MAX_WALK_DISTANCE_METERS (1 km).
 *   - Total walking distance across all walk segments ≤ MAX_TOTAL_WALK_DISTANCE_METERS (2 km).
 *
 * Returns `{ valid: true }` if the route passes, or `{ valid: false, reason }` if it fails.
 */
export function validateWalkingDistance(
  route: CommuteRoute,
): WalkValidationResult {
  const walkSegments = route.transportSegments.filter((s) => s.mode === "walk");

  for (const seg of walkSegments) {
    if (seg.distanceMeters > MAX_WALK_DISTANCE_METERS) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Route ${route.routeId}] Rejected: walk segment "${seg.instructions}" ` +
            `is ${seg.distanceMeters} m — exceeds MAX_WALK_DISTANCE_METERS (${MAX_WALK_DISTANCE_METERS} m).`,
        );
      }
      return {
        valid: false,
        reason: `Walk segment "${seg.instructions}" is ${seg.distanceMeters} m, exceeds the 1 km limit.`,
      };
    }
  }

  const totalWalk = walkSegments.reduce((sum, s) => sum + s.distanceMeters, 0);
  if (totalWalk > MAX_TOTAL_WALK_DISTANCE_METERS) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Route ${route.routeId}] Rejected: total walk distance ${totalWalk} m ` +
          `exceeds MAX_TOTAL_WALK_DISTANCE_METERS (${MAX_TOTAL_WALK_DISTANCE_METERS} m).`,
      );
    }
    return {
      valid: false,
      reason: `Total walking distance is ${totalWalk} m, exceeds the 2 km combined limit.`,
    };
  }

  return { valid: true };
}
