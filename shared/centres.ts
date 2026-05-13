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
      { grade: 'black',   label: 'Black',   name: 'Black (e.g. Flat White, Wardell Way, Community Service)', terrainClass: 'reinforced' },
      { grade: 'orange',  label: 'Orange',  name: 'Orange/Double-black (e.g. Big Bore, Dances with Wolves, 3G)', terrainClass: 'natural-improved' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (unbuilt forest lines)', terrainClass: 'natural' },
    ],
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
      { grade: 'blue',    label: 'Blue',    name: 'Blue (Spooky Wood, flowing singletrack)', terrainClass: 'reinforced' },
      { grade: 'red',     label: 'Red',     name: 'Red (Thunderstruck, Steep & Loamy)', terrainClass: 'reinforced' },
      { grade: 'black',   label: 'Black',   name: 'Black (tech features, rock cruxes)', terrainClass: 'natural-improved' },
      { grade: 'natural', label: 'Natural', name: "Natural / off-piste (Janet's Brae, unbuilt lines)", terrainClass: 'natural' },
    ],
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
      { grade: 'blue',    label: 'Blue',    name: 'Blue (Squirrel Chaser)', terrainClass: 'reinforced' },
      { grade: 'red',     label: 'Red',     name: "Red (Polty's, Nitrous, Big 'Un)", terrainClass: 'natural-improved' },
      { grade: 'black',   label: 'Black',   name: 'Black (The Edge, Bone Shaker)', terrainClass: 'natural-improved' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (unbuilt forest lines)', terrainClass: 'natural' },
    ],
  },
];
