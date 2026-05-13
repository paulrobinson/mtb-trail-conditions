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
      { name: 'Built trails (e.g. Flat White, Wardell Way, Community Service)', terrainClass: 'reinforced' },
      { name: 'Natural-line trails (e.g. Big Bore, Dances with Wolves, 3G)',    terrainClass: 'natural-improved' },
      { name: 'Off-piste (unbuilt forest lines)',                                terrainClass: 'natural' },
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
      { name: 'Built flowing (e.g. Spooky Wood)',                               terrainClass: 'reinforced' },
      { name: 'Built tech (e.g. Thunderstruck, Steep & Loamy)',                 terrainClass: 'reinforced' },
      { name: 'Natural-line tech (e.g. rock cruxes, tech features)',            terrainClass: 'natural-improved' },
      { name: "Off-piste (e.g. Janet's Brae, unbuilt lines)",                   terrainClass: 'natural' },
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
      { name: 'Built (e.g. Squirrel Chaser)',                                   terrainClass: 'reinforced' },
      { name: "Natural-line (e.g. Polty's, Nitrous, Big 'Un)",                  terrainClass: 'natural-improved' },
      { name: 'Natural-line tech (e.g. The Edge, Bone Shaker)',                 terrainClass: 'natural-improved' },
      { name: 'Off-piste (unbuilt forest lines)',                                terrainClass: 'natural' },
    ],
  },
];
