/**
 * Maximum walking distance for a single leg (origin → first stop, or last stop → destination).
 * Any route with a walk segment exceeding this value must be rejected.
 */
export const MAX_WALK_DISTANCE_METERS = 1000;

/**
 * Maximum total walking distance across all walk segments in a route
 * (1 km at the start + 1 km at the end = 2 km combined).
 */
export const MAX_TOTAL_WALK_DISTANCE_METERS = 2000;
