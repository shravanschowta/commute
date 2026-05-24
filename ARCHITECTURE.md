# CommuteBLR Architecture

## Free geostack (no Google / no Mapbox key)

| Layer | Service |
|-------|---------|
| Maps | MapLibre GL + OpenFreeMap tiles |
| Autocomplete | Photon (Komoot / OSM) |
| Reverse geocode | Nominatim |
| Walking (optional) | OSRM public API |

## Route engine

`GraphRouteEngine` (`src/lib/routes/graph-engine.ts`):

1. Nearest Namma Metro stations (Purple / Green graph in `data/metro/`)
2. BMTC corridor matching (`data/bmtc/`)
3. Generates multimodal candidates: metro+walk, bus+metro, uber direct, uber+metro, bus-only
4. Scores by user preference (`src/lib/routes/scoring.ts`)
5. Returns **top 5** routes with segments, costs, CO₂, polylines

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home search (Stitch UI) |
| `/routes` | 5 route cards + live map |
| `/routes/[routeId]` | Timeline, metrics, map |
| `/uber` | Uber deep-link booking |
| `/saved` | Saved trips hub |
| `/profile` | Settings / stack info |

## Data

- `data/metro/stations.json` — expandable station graph
- `data/bmtc/corridors.json` — bus corridors

## Storage

- `sessionStorage` — last route search (for detail pages)
- `localStorage` — saved trips (default seed data)
- Supabase schema in `supabase/migrations/` when keys are set
