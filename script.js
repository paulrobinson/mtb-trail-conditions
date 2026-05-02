/* ═══════════════════════════════════════════════════════════
   TRAIL CENTRE DEFINITIONS
   ═══════════════════════════════════════════════════════════ */
const TRAIL_CENTRES = [
  {
    id: 'golfie',
    name: 'The Golfie',
    location: 'Innerleithen, Scottish Borders',
    lat: 55.6175,
    lon: -3.0617,
    timezone: 'Europe/London',
    note: 'Natural enduro trails — steep, technical, roots & shale. All black or orange grade.',
    trails: [
      { grade: 'black',  label: 'Black', name: 'Black (e.g. Flat White, Wardell Way, Community Service)', surfaceType: 'mixed' },
      { grade: 'orange', label: 'Orange', name: 'Orange/Double-black (e.g. Big Bore, Dances with Wolves, 3G)', surfaceType: 'loam-rock' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (unbuilt forest lines)', surfaceType: 'natural' },
    ],
    // Drainage: Rocky venue drains fast — 2-3 dry days adequate after heavy rain
    drainageFactor: 0.72,
    // Surface sensitivity weights per type
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
      { grade: 'blue',  label: 'Blue',  name: 'Blue (Spooky Wood, flowing singletrack)', surfaceType: 'loam' },
      { grade: 'red',   label: 'Red',   name: 'Red (Thunderstruck, Steep & Loamy)', surfaceType: 'loam' },
      { grade: 'black', label: 'Black', name: 'Black (tech features, rock cruxes)', surfaceType: 'loam-rock' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (Janet\'s Brae, unbuilt lines)', surfaceType: 'natural' },
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
      { grade: 'blue',  label: 'Blue',  name: 'Blue (Squirrel Chaser)', surfaceType: 'mixed' },
      { grade: 'red',   label: 'Red',   name: 'Red (Polty\'s, Nitrous, Big \'Un)', surfaceType: 'clay-loam' },
      { grade: 'black', label: 'Black', name: 'Black (The Edge, Bone Shaker)', surfaceType: 'clay-loam' },
      { grade: 'natural', label: 'Natural', name: 'Natural / off-piste (unbuilt forest lines)', surfaceType: 'natural' },
    ],
    // Clay soil: slow draining — needs 4-5 dry days to recover
    drainageFactor: 0.38,
    surfaceSensitivity: { hardpack: 0.3, mixed: 0.65, 'clay-loam': 1.0, natural: 1.4 },
  },
];

/* ═══════════════════════════════════════════════════════════
   CONDITION SCORING ENGINE

   Algorithm:
   1. Compute a weighted rainfall sum for past 14 days:
      - Recent rain (last 3 days) weighted 3x
      - Mid-term rain (days 4-7) weighted 1.5x
      - Older rain (days 8-14) weighted 0.6x
   2. Apply drainage factor: centres that drain faster
      have their effective saturation reduced.
   3. Adjust for temperature (frost/freeze = slick bonus;
      high temp + wind = faster drying).
   4. Map to 4 categories: Good / Tacky / Boggy / Avoid

   ═══════════════════════════════════════════════════════════ */
function scoreConditions(centre, history, currentWeather) {
  const days = history.daily;
  const n = days.precipitation_sum.length;

  // Build weighted rainfall score
  let weightedRain = 0;
  for (let i = 0; i < n; i++) {
    const daysAgo = n - 1 - i; // 0 = today/most recent
    const mm = days.precipitation_sum[i] || 0;
    let weight = 0.6;
    if (daysAgo <= 2) weight = 3.0;
    else if (daysAgo <= 6) weight = 1.5;

    // Apply drainage: wetter soil already present allows less time for each mm to matter
    weightedRain += mm * weight * (1 - centre.drainageFactor * (daysAgo / n));
  }

  // Temperature adjustment: prolonged cold slows drainage
  const recentTemps = days.temperature_2m_mean.slice(-3);
  const avgTemp = recentTemps.reduce((a, b) => a + (b || 0), 0) / recentTemps.length;
  if (avgTemp < 2) weightedRain *= 1.2;   // near-freeze = slower drainage
  else if (avgTemp > 12) weightedRain *= 0.85; // warm = faster drainage

  // Wind drying bonus
  const recentWind = days.wind_speed_10m_max.slice(-3);
  const avgWind = recentWind.reduce((a, b) => a + (b || 0), 0) / recentWind.length;
  if (avgWind > 25) weightedRain *= 0.9;

  // Map to condition
  let conditionKey, conditionLabel;
  if (weightedRain < 15)       { conditionKey = 'good';  conditionLabel = 'Riding Good'; }
  else if (weightedRain < 35)  { conditionKey = 'tacky'; conditionLabel = 'Tacky — Nice'; }
  else if (weightedRain < 65)  { conditionKey = 'boggy'; conditionLabel = 'Getting Boggy'; }
  else                         { conditionKey = 'avoid'; conditionLabel = 'Swamp Mode'; }

  // Per-trail-type sub-scores (use the surface sensitivity)
  const trailConditions = centre.trails.map(trail => {
    const sensitivity = centre.surfaceSensitivity[trail.surfaceType] ?? 0.7;
    const effectiveScore = weightedRain * sensitivity;
    let status, statusClass;
    if (effectiveScore < 15)      { status = 'Riding well';   statusClass = 'good'; }
    else if (effectiveScore < 35) { status = 'Tacky, fun';    statusClass = 'tacky'; }
    else if (effectiveScore < 65) { status = 'Muddy patches'; statusClass = 'boggy'; }
    else                          { status = 'Avoid';         statusClass = 'avoid'; }
    return { ...trail, status, statusClass };
  });

  // Rainfall summary stats
  const totalLast7  = days.precipitation_sum.slice(-7).reduce((a, b) => a + (b || 0), 0);
  const totalLast14 = days.precipitation_sum.reduce((a, b) => a + (b || 0), 0);
  const dryStreak   = getDryStreak(days.precipitation_sum);

  return {
    conditionKey,
    conditionLabel,
    trailConditions,
    saturationPct: Math.min(100, Math.round(weightedRain / 80 * 100)),
    totalLast7: totalLast7.toFixed(1),
    totalLast14: totalLast14.toFixed(1),
    dryStreak,
  };
}

function getDryStreak(precipArr) {
  let streak = 0;
  for (let i = precipArr.length - 1; i >= 0; i--) {
    if ((precipArr[i] || 0) < 0.5) streak++;
    else break;
  }
  return streak;
}

/* ═══════════════════════════════════════════════════════════
   WEATHER ICON
   ═══════════════════════════════════════════════════════════ */
function weatherIcon(precipSum, windMax, tempMax) {
  if (precipSum > 10)  return '🌧️';
  if (precipSum > 3)   return '🌦️';
  if (precipSum > 0.5) return '🌂';
  if (windMax > 40)    return '💨';
  if (tempMax < 2)     return '❄️';
  if (tempMax > 18)    return '☀️';
  return '⛅';
}

/* ═══════════════════════════════════════════════════════════
   FETCH WEATHER (Open-Meteo)
   ═══════════════════════════════════════════════════════════ */
async function fetchWeather(centre) {
  const BASE = 'https://api.open-meteo.com/v1/forecast';
  const params = new URLSearchParams({
    latitude:  centre.lat,
    longitude: centre.lon,
    timezone:  centre.timezone,
    past_days: 14,
    forecast_days: 7,
    daily: [
      'precipitation_sum',
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
      'precipitation_probability_max',
    ].join(','),
    current: [
      'temperature_2m',
      'precipitation',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
    ].join(','),
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${centre.name}`);
  return res.json();
}

/* ═══════════════════════════════════════════════════════════
   DATE UTILITIES
   ═══════════════════════════════════════════════════════════ */
function formatDayLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return 'Today';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function windDirLabel(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/* ═══════════════════════════════════════════════════════════
   RENDER CARD
   selectedDate: YYYY-MM-DD string — score conditions as of this date
   ═══════════════════════════════════════════════════════════ */
function renderCard(centre, weatherData, selectedDate) {
  const today = getTodayStr();
  const days  = weatherData.daily;
  const n     = days.time.length;

  // Use selectedDate if provided, else today
  const scoreDate = selectedDate || today;
  const scoreDateIdx = days.time.indexOf(scoreDate);
  const todayIdx    = days.time.indexOf(today);

  // Slice data up to and including the selected date for scoring
  const sliceEnd = scoreDateIdx >= 0 ? scoreDateIdx + 1 : (todayIdx >= 0 ? todayIdx + 1 : n);
  const history = {
    daily: {
      precipitation_sum:             days.precipitation_sum.slice(0, sliceEnd),
      temperature_2m_max:            days.temperature_2m_max.slice(0, sliceEnd),
      temperature_2m_min:            days.temperature_2m_min.slice(0, sliceEnd),
      temperature_2m_mean:           days.temperature_2m_mean.slice(0, sliceEnd),
      wind_speed_10m_max:            days.wind_speed_10m_max.slice(0, sliceEnd),
      precipitation_probability_max: days.precipitation_probability_max.slice(0, sliceEnd),
    }
  };

  const score = scoreConditions(centre, history, weatherData.current);

  // Build a human-readable label for the condition badge
  const isToday = scoreDate === today;
  const scoreDateObj = new Date(scoreDate + 'T12:00:00');
  const scoreDateLabel = isToday
    ? 'Today\'s conditions'
    : 'Projected for ' + scoreDateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  // Rainfall bar chart — all 21 days, highlight selected date
  const maxPrecip = Math.max(...days.precipitation_sum.map(v => v || 0), 1);
  const barsHTML = days.time.map((dateStr, i) => {
    const mm = days.precipitation_sum[i] || 0;
    const pct = Math.max(2, (mm / maxPrecip) * 100);
    const isSelected = dateStr === scoreDate;
    const isT        = dateStr === today;
    const isFuture   = i > (todayIdx >= 0 ? todayIdx : sliceEnd - 1);
    const isBeyond   = i > scoreDateIdx && scoreDateIdx >= 0; // after selected date = dimmed
    const d   = new Date(dateStr + 'T12:00:00');
    const lbl = isT ? 'Today' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });

    let cls = isFuture ? 'future' : 'past';
    if (isT) cls = 'today';
    let extraStyle = '';
    if (isSelected && !isT) extraStyle = 'opacity:1;filter:brightness(1.4)';
    if (isBeyond) extraStyle = 'opacity:0.2';

    return `
      <div class="bar-col" title="${dateStr}: ${mm.toFixed(1)}mm">
        <div class="bar-fill ${cls}" style="height:${pct}%;${extraStyle}"></div>
        <div class="bar-label ${isSelected ? 'today-label' : ''}">${isSelected && !isT ? scoreDateObj.toLocaleDateString('en-GB', { weekday: 'short' }) : lbl}</div>
      </div>`;
  }).join('');

  // Forecast strip — 7 days from today, highlight selected date
  const forecastStart = todayIdx >= 0 ? todayIdx : (sliceEnd - 1);
  const forecastHTML = days.time.slice(forecastStart, forecastStart + 7).map((dateStr, fi) => {
    const i          = forecastStart + fi;
    const isSelected = dateStr === scoreDate;
    const isT        = dateStr === today;
    const dayLabel   = isT ? 'Today' : new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
    const mm   = days.precipitation_sum[i] || 0;
    const tMax = Math.round(days.temperature_2m_max[i] || 0);
    const tMin = Math.round(days.temperature_2m_min[i] || 0);
    const wMax = Math.round(days.wind_speed_10m_max[i] || 0);
    const wDir = windDirLabel(days.wind_direction_10m_dominant[i] || 0);
    const prob = days.precipitation_probability_max[i] || 0;
    const icon = weatherIcon(mm, wMax, tMax);
    const dateNum = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return `
      <div class="forecast-day ${isSelected ? 'today' : ''}" title="${dateStr}">
        <div class="forecast-day-name">${dayLabel}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-faint)">${dateNum}</div>
        <div class="forecast-icon">${icon}</div>
        <div class="forecast-temp-range">
          <span class="forecast-temp-max">${tMax}°</span>
          <span class="forecast-temp-min">${tMin}°</span>
        </div>
        ${mm > 0.2 ? `<div class="forecast-precip">${mm.toFixed(1)}mm <span style="opacity:0.7">${prob}%</span></div>` : `<div class="forecast-precip" style="opacity:0.3">Dry</div>`}
        <div class="forecast-wind">${wMax} km/h ${wDir}</div>
      </div>`;
  }).join('');

  // Trail type rows
  const trailRowsHTML = score.trailConditions.map(t => `
    <div class="trail-type-row">
      <div class="trail-type-info">
        <span class="trail-grade-wrap" data-tip-text="${t.name}">
          <span class="trail-grade grade-${t.grade}">${t.label}</span>
        </span>
      </div>
      <span class="trail-type-status" style="color:var(--color-${t.statusClass})">${t.status}</span>
    </div>`).join('');

  // Saturation bar colour
  const satPct = score.saturationPct;
  const satColor = satPct < 25 ? 'var(--color-good)' :
                   satPct < 50 ? 'var(--color-tacky)' :
                   satPct < 75 ? 'var(--color-boggy)' : 'var(--color-avoid)';

  // Selected day weather for the stats row
  const selI = scoreDateIdx >= 0 ? scoreDateIdx : (todayIdx >= 0 ? todayIdx : 0);
  const selTemp = Math.round(days.temperature_2m_max[selI] || 0);
  const selWind = Math.round(days.wind_speed_10m_max[selI] || 0);
  const selMm   = (days.precipitation_sum[selI] || 0).toFixed(1);
  const selProb = days.precipitation_probability_max[selI] || 0;

  // Current temp/wind (only meaningful for today)
  const cur = weatherData.current;
  const nowStats = isToday
    ? `<div class="stat-pill">Now: <strong>${cur ? Math.round(cur.temperature_2m) : selTemp}°C</strong></div>
       <div class="stat-pill">Wind: <strong>${cur ? Math.round(cur.wind_speed_10m) : selWind} km/h</strong></div>`
    : `<div class="stat-pill">High: <strong>${selTemp}°C</strong></div>
       <div class="stat-pill">Wind: <strong>${selWind} km/h</strong></div>
       <div class="stat-pill">Rain: <strong>${selMm}mm</strong> <span style="opacity:0.6">${selProb}%</span></div>`;

  return `
    <article class="trail-card" data-centre="${centre.id}">
      <!-- Card header -->
      <div class="card-header">
        <div class="card-meta">
          <span class="card-location">${centre.location}</span>
          <h2 class="card-name">${centre.name}</h2>
          <p class="card-trails-note">${centre.note}</p>
        </div>
        <div class="condition-badge">
          <div class="condition-pill ${score.conditionKey}">
            <span class="dot"></span>
            ${score.conditionLabel}
          </div>
          <span class="condition-label">${scoreDateLabel}</span>
        </div>
      </div>

      <!-- Card body: two columns -->
      <div class="card-body">
        <!-- Left: Saturation & trail types -->
        <div class="card-section">
          <p class="section-title">Ground Saturation</p>
          <div class="saturation-block">
            <div class="sat-row">
              <span class="sat-label">Overall</span>
              <div class="sat-bar-wrap">
                <div class="sat-bar" style="width:${satPct}%;background:${satColor}"></div>
              </div>
              <span class="sat-value">${satPct}%</span>
            </div>
          </div>
          <div class="stats-row">
            <div class="stat-pill">Rain prev 7d: <strong>${score.totalLast7}mm</strong></div>
            <div class="stat-pill">Rain prev 14d: <strong>${score.totalLast14}mm</strong></div>
            ${score.dryStreak > 0 ? `<div class="stat-pill">Dry run-in: <strong>${score.dryStreak}d</strong></div>` : ''}
          </div>
          <div class="trail-types" style="margin-top:var(--space-4)">
            <p class="section-title" style="margin-bottom:var(--space-2)">Trail Types</p>
            ${trailRowsHTML}
          </div>
        </div>

        <!-- Right: forecast -->
        <div class="card-section">
          <p class="section-title">7-Day Forecast</p>
          <div class="forecast-strip">${forecastHTML}</div>
          <div class="stats-row" style="margin-top:var(--space-4)">
            ${nowStats}
          </div>
        </div>
      </div>

      <!-- Card footer: rainfall chart -->
      <div class="card-footer">
        <p class="section-title">Rainfall — Past 14 Days + Forecast ${!isToday ? '· <span style="color:var(--color-primary)">Selected day highlighted</span>' : ''}</p>
        <div class="rainfall-chart-wrap">
          <div class="bar-chart">${barsHTML}</div>
        </div>
      </div>
    </article>`;
}

/* ═══════════════════════════════════════════════════════════
   DATE PICKER — build buttons from available forecast dates
   ═══════════════════════════════════════════════════════════ */
let _weatherResults = null;   // cached API results
let _selectedDate   = null;   // currently selected date string

function buildDatePicker(weatherData) {
  // Use first centre's dates (all centres have same date range)
  const days  = weatherData.daily;
  const today = getTodayStr();
  const todayIdx = days.time.indexOf(today);
  if (todayIdx < 0) return;

  // Offer today + next 6 days
  const dates = days.time.slice(todayIdx, todayIdx + 7);

  const container = document.getElementById('dateBtns');
  container.innerHTML = dates.map(dateStr => {
    const isT    = dateStr === today;
    const d      = new Date(dateStr + 'T12:00:00');
    const dayLbl = isT ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' });
    const dateLbl = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    // Rain on that day for context
    const i   = days.time.indexOf(dateStr);
    const mm  = days.precipitation_sum[i] || 0;
    const rainLbl = mm > 0.5 ? `${mm.toFixed(1)}mm` : '';

    return `<button class="date-btn ${dateStr === _selectedDate ? 'active' : ''}" onclick="selectDate('${dateStr}')" aria-pressed="${dateStr === _selectedDate}">
      <span class="date-btn-day">${dayLbl}</span>
      <span class="date-btn-date">${dateLbl}</span>
      <span class="date-btn-rain">${rainLbl}</span>
    </button>`;
  }).join('');

  document.getElementById('datePickerBar').style.display = 'block';
}

function selectDate(dateStr) {
  _selectedDate = dateStr;
  // Re-render cards with new selected date
  if (_weatherResults) {
    const grid = document.getElementById('trailsGrid');
    grid.innerHTML = TRAIL_CENTRES.map((c, i) => renderCard(c, _weatherResults[i], _selectedDate)).join('');
  }
  // Update button active states
  document.querySelectorAll('.date-btn').forEach(btn => {
    const active = btn.onclick.toString().includes(`'${dateStr}'`);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
}

/* ═══════════════════════════════════════════════════════════
   FETCH ALL & RENDER
   ═══════════════════════════════════════════════════════════ */
async function fetchAll() {
  const grid    = document.getElementById('trailsGrid');
  const loading = document.getElementById('loadingState');
  const error   = document.getElementById('errorState');
  const icon    = document.getElementById('refreshIcon');
  const updated = document.getElementById('lastUpdated');

  // Show loading
  grid.style.display    = 'none';
  error.style.display   = 'none';
  loading.style.display = 'flex';
  icon.classList.add('spin-icon');

  try {
    const results = await Promise.all(
      TRAIL_CENTRES.map(c => fetchWeather(c))
    );

    _weatherResults = results;
    // Default selected date = today
    _selectedDate = getTodayStr();

    grid.innerHTML = TRAIL_CENTRES.map((c, i) => renderCard(c, results[i], _selectedDate)).join('');
    buildDatePicker(results[0]);

    loading.style.display = 'none';
    grid.style.display    = 'grid';

    const now = new Date();
    updated.textContent = `Updated ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (err) {
    loading.style.display = 'none';
    error.style.display   = 'flex';
    document.getElementById('errorMsg').textContent =
      `Unable to fetch weather data: ${err.message}. Check your connection and try again.`;
    console.error(err);
  } finally {
    icon.classList.remove('spin-icon');
  }
}

/* ═══════════════════════════════════════════════════════════
   DARK MODE TOGGLE
   ═══════════════════════════════════════════════════════════ */
(function() {
  const html   = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let theme = 'dark'; // Default dark for night-time trail planners
  html.setAttribute('data-theme', theme);

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }

  toggle && toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    updateToggleIcon();
  });

  updateToggleIcon();
})();

/* ─── TOOLTIP (fixed position, works inside overflow:hidden) ─ */
(function() {
  const tip = document.createElement('div');
  tip.id = 'trail-tooltip-global';
  document.body.appendChild(tip);

  let currentWrap = null;

  function showTip(wrap) {
    const text = wrap.dataset.tipText;
    if (!text) return;
    tip.textContent = text;
    tip.style.display = 'block';
    positionTip(wrap);
    currentWrap = wrap;
  }

  function hideTip() {
    tip.style.display = 'none';
    currentWrap = null;
  }

  function positionTip(wrap) {
    const r = wrap.getBoundingClientRect();
    // Try above first
    const tipH = tip.offsetHeight || 32;
    const spaceAbove = r.top;
    const top = spaceAbove > tipH + 10
      ? r.top - tipH - 6
      : r.bottom + 6;
    let left = r.left;
    // Keep within viewport
    const vpW = window.innerWidth;
    const tipW = tip.offsetWidth || 180;
    if (left + tipW > vpW - 8) left = vpW - tipW - 8;
    tip.style.top  = top + 'px';
    tip.style.left = left + 'px';
  }

  // Desktop: hover
  document.addEventListener('mouseover', e => {
    const wrap = e.target.closest('.trail-grade-wrap');
    if (wrap) showTip(wrap);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('.trail-grade-wrap')) hideTip();
  });

  // Mobile: tap
  document.addEventListener('click', e => {
    const wrap = e.target.closest('.trail-grade-wrap');
    if (wrap) {
      if (currentWrap === wrap) { hideTip(); }
      else { showTip(wrap); }
      e.stopPropagation();
    } else {
      hideTip();
    }
  });
})();

/* ─── BOOT ──────────────────────────────────────────── */
fetchAll();
