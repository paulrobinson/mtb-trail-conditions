import type { TrailCentre } from './types.js';

export const TRAIL_CENTRES: TrailCentre[] = [
  {
    id: 'golfie',
    name: 'The Golfie',
    location: 'Innerleithen, Scottish Borders',
    lat: 55.6175,
    lon: -3.0617,
    timezone: 'Europe/London',
    note: 'Natural enduro trails — steep, technical, roots & shale. All black or orange grade.',
    trails: [
      { grade: 'black',   label: 'Black',   name: 'Black (e.g. Flat White, Wardell Way, Community Service)', surfaceType: 'mixed' },
      { grade: 'orange',  label: 'Orange',  name: 'Orange/Double-black (e.g. Big Bore, Dances with Wolves, 3G)', surfaceType: 'loam-rock' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (unbuilt forest lines)', surfaceType: 'natural' },
    ],
    // Rocky venue drains fast — 2-3 dry days adequate after heavy rain
    drainageFactor: 0.72,
    surfaceSensitivity: { hardpack: 0.4, mixed: 0.7, 'loam-rock': 1.0, natural: 1.3 },
  },
  {
    id: 'glentress',
    name: 'Glentress Trail Centre',
    location: 'Peebles, Scottish Borders',
    lat: 55.6450,
    lon: -3.1620,
    timezone: 'Europe/London',
    note: 'World-class trail centre — varied loamy singletrack, forest DH',
    trails: [
      { grade: 'blue',    label: 'Blue',    name: 'Blue (Spooky Wood, flowing singletrack)', surfaceType: 'loam' },
      { grade: 'red',     label: 'Red',     name: 'Red (Thunderstruck, Steep & Loamy)', surfaceType: 'loam' },
      { grade: 'black',   label: 'Black',   name: 'Black (tech features, rock cruxes)', surfaceType: 'loam-rock' },
      { grade: 'natural', label: 'Natural', name: "Natural / off-piste (Janet's Brae, unbuilt lines)", surfaceType: 'natural' },
    ],
    // Forest soil, decent drainage but loam holds water longer
    drainageFactor: 0.55,
    surfaceSensitivity: { hardpack: 0.35, loam: 1.0, 'loam-rock': 0.85, natural: 1.2 },
  },
  {
    id: 'hamsterley',
    name: 'Hamsterley Forest',
    location: 'County Durham, North England',
    lat: 54.7128,
    lon: -1.9284,
    timezone: 'Europe/London',
    note: 'Varied forest DH & trail — clay-heavy soil, slower to drain',
    trails: [
      { grade: 'blue',    label: 'Blue',    name: 'Blue (Squirrel Chaser)', surfaceType: 'mixed' },
      { grade: 'red',     label: 'Red',     name: "Red (Polty's, Nitrous, Big 'Un)", surfaceType: 'clay-loam' },
      { grade: 'black',   label: 'Black',   name: 'Black (The Edge, Bone Shaker)', surfaceType: 'clay-loam' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (unbuilt forest lines)', surfaceType: 'natural' },
    ],
    // Clay soil: slow draining — needs 4-5 dry days to recover
    drainageFactor: 0.38,
    surfaceSensitivity: { hardpack: 0.3, mixed: 0.65, 'clay-loam': 1.0, natural: 1.4 },
  },
];
