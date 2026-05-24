# CommuteBLR

Multimodal commute planner for Bangalore — **Namma Metro**, **BMTC**, **Uber**, and **walking**.

## No paid map API required

| Feature | Provider | API key |
|---------|----------|---------|
| Map tiles | [OpenFreeMap](https://openfreemap.org) + MapLibre | None |
| Place search | [Photon](https://photon.komoot.io) (OSM) | None |
| Reverse geocode | [Nominatim](https://nominatim.org) | None |
| Walking routes (optional) | [OSRM](https://project-osrm.org) public | None |

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` → `.env.local` and add Supabase keys for cloud sync.

## Features

- Home search with Photon autocomplete + GPS
- **5 optimized routes** (metro, bus, uber combos) from graph engine
- Interactive MapLibre map with colored mode polylines
- Route details timeline + cost breakdown
- Uber deep-link booking page
- Saved trips (localStorage; Supabase optional)
- Purple / Green metro graph + BMTC corridors

## Project layout

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Commands

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production server
```
