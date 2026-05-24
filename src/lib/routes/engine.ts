import { GraphRouteEngine } from "@/lib/routes/graph-engine";
import type {
  RouteSearchRequest,
  RouteSearchResponse,
} from "@/types/route";

export interface RouteEngine {
  search(request: RouteSearchRequest): Promise<RouteSearchResponse>;
}

export const routeEngine: RouteEngine = new GraphRouteEngine();
