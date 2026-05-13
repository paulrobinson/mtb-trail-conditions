import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { geologyCache } from './db/schema.js';
import { TRAIL_CENTRES } from '../shared/centres.js';

const BGS_WMS = 'https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer';

// Geology cache TTL: 30 days (geology doesn't change)
const GEOLOGY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Default when BGS returns no data or the request fails
const DEFAULT_DRAINAGE_FACTOR = 0.5;

/**
 * Drainage factors by terrain category (0 = worst drainage, 1 = best drainage).
 *
 * Superficial deposits are checked first — they sit above bedrock and dominate
 * surface drainage on lower slopes. Bedrock is used as fallback (reliable for
 * high-elevation DH venues where soils are thin).
 */
const SUPERFICIAL_RULES: Array<{ keywords: string[]; factor: number }> = [
  { keywords: ['peat'],                                       factor: 0.20 },
  { keywords: ['alluvium', 'alluvial'],                       factor: 0.25 },
  { keywords: ['till', 'boulder clay', 'diamicton'],          factor: 0.30 },
  { keywords: ['head', 'solifluction'],                       factor: 0.35 },
  { keywords: ['river terrace', 'terrace deposit'],           factor: 0.50 },
  { keywords: ['glaciofluvial', 'fluvioglacial', 'outwash'],  factor: 0.65 },
  { keywords: ['sand and gravel', 'fluvial sand'],            factor: 0.70 },
];

const BEDROCK_RULES: Array<{ keywords: string[]; factor: number }> = [
  { keywords: ['chalk'],                                                      factor: 0.85 },
  { keywords: ['limestone', 'calcareous'],                                    factor: 0.80 },
  { keywords: ['granite', 'granodiorite', 'diorite', 'tonalite'],            factor: 0.75 },
  { keywords: ['sandstone', 'arenite', 'arkose', 'grit'],                    factor: 0.70 },
  { keywords: ['quartzite', 'quartzose'],                                     factor: 0.70 },
  { keywords: ['greywacke', 'wacke', 'turbidite', 'flysch'],                 factor: 0.65 },
  { keywords: ['gneiss', 'schist', 'migmatite'],                             factor: 0.60 },
  { keywords: ['slate', 'phyllite', 'hornfels'],                              factor: 0.60 },
  { keywords: ['basalt', 'dolerite', 'andesite', 'rhyolite', 'tuff', 'lava', 'volcanic'], factor: 0.60 },
  { keywords: ['gabbro', 'peridotite', 'pyroxenite'],                        factor: 0.65 },
  { keywords: ['coal', 'carboniferous'],                                      factor: 0.35 },
  { keywords: ['mudstone', 'claystone', 'argillite', 'pelite'],              factor: 0.30 },
  { keywords: ['siltstone', 'silty'],                                         factor: 0.35 },
  { keywords: ['shale'],                                                       factor: 0.28 },
  { keywords: ['marl', 'clay'],                                               factor: 0.30 },
];

function matchRules(
  description: string,
  rules: Array<{ keywords: string[]; factor: number }>
): number | null {
  const lower = description.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.factor;
    }
  }
  return null;
}

function buildWmsUrl(lat: number, lon: number, layer: string): string {
  const delta = 0.001;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetFeatureInfo',
    LAYERS: layer,
    QUERY_LAYERS: layer,
    CRS: 'CRS:84',
    BBOX: bbox,
    WIDTH: '3',
    HEIGHT: '3',
    I: '1',
    J: '1',
    INFO_FORMAT: 'application/json',
  });
  return `${BGS_WMS}?${params}`;
}

function extractDescription(body: unknown): string {
  try {
    const fc = body as { features?: Array<{ properties?: Record<string, unknown> }> };
    const props = fc?.features?.[0]?.properties;
    if (!props) return '';
    return Object.values(props)
      .filter((v): v is string => typeof v === 'string')
      .join(' ');
  } catch {
    return '';
  }
}

async function fetchBgsLayer(lat: number, lon: number, layer: string): Promise<string> {
  const url = buildWmsUrl(lat, lon, layer);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return '';
  return extractDescription(await res.json());
}

export async function resolveDrainageFactor(lat: number, lon: number): Promise<{ drainageFactor: number; rockDescription: string }> {
  // Try superficial deposits first
  const superficialDesc = await fetchBgsLayer(lat, lon, 'BGS.50k.Superficial.deposits');
  if (superficialDesc) {
    const factor = matchRules(superficialDesc, SUPERFICIAL_RULES);
    if (factor !== null) {
      return { drainageFactor: factor, rockDescription: superficialDesc.trim() };
    }
  }

  // Fall back to bedrock
  const bedrockDesc = await fetchBgsLayer(lat, lon, 'BGS.50k.Bedrock');
  if (bedrockDesc) {
    const factor = matchRules(bedrockDesc, BEDROCK_RULES);
    if (factor !== null) {
      return { drainageFactor: factor, rockDescription: bedrockDesc.trim() };
    }
  }

  const description = bedrockDesc || superficialDesc || 'unknown';
  return { drainageFactor: DEFAULT_DRAINAGE_FACTOR, rockDescription: description.trim() };
}

export async function getGeologyForCentre(centreId: string): Promise<number> {
  const centre = TRAIL_CENTRES.find(c => c.id === centreId);
  if (!centre) throw new Error(`Unknown centre: ${centreId}`);

  const now = Date.now();
  const cached = db.select().from(geologyCache).where(eq(geologyCache.centreId, centreId)).get();

  if (cached && now - cached.fetchedAt < GEOLOGY_TTL_MS) {
    return cached.drainageFactor;
  }

  const { drainageFactor, rockDescription } = await resolveDrainageFactor(centre.lat, centre.lon);

  db.insert(geologyCache)
    .values({ centreId, drainageFactor, rockDescription, fetchedAt: now })
    .onConflictDoUpdate({
      target: geologyCache.centreId,
      set: { drainageFactor, rockDescription, fetchedAt: now },
    })
    .run();

  return drainageFactor;
}
