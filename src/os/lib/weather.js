import { useEffect, useState } from 'react';

// Live weather from Open-Meteo (free, no key, CORS-friendly), fetched once per visit.
// offset: the city's usual UTC offset in seconds, used when the backup source doesn't send one
export const CITIES = [
  { name: 'Pilani', lat: 28.37, lon: 75.6, offset: 19800 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88, offset: 19800 },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, offset: 19800 },
  { name: 'San Francisco', lat: 37.77, lon: -122.42, offset: -28800 },
  { name: 'London', lat: 51.51, lon: -0.13, offset: 0 },
  { name: 'New York', lat: 40.71, lon: -74.01, offset: -18000 },
];

const CODES = [
  [[0], 'Clear', '☀️'],
  [[1, 2], 'Partly Cloudy', '⛅'],
  [[3], 'Cloudy', '☁️'],
  [[45, 48], 'Fog', '🌫️'],
  [[51, 53, 55, 56, 57], 'Drizzle', '🌦️'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Rain', '🌧️'],
  [[71, 73, 75, 77, 85, 86], 'Snow', '🌨️'],
  [[95, 96, 99], 'Thunderstorm', '⛈️'],
];
export function describe(code) {
  const hit = CODES.find(([cs]) => cs.includes(code));
  return hit ? { label: hit[1], icon: hit[2] } : { label: 'Clear', icon: '☀️' };
}

// fetch with a time limit, so a stalled network falls through to the next source
function getJSON(url, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { signal: ctl.signal })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((d) => (d && d.error ? Promise.reject(new Error(d.reason)) : d))
    .finally(() => clearTimeout(t));
}

function fromOpenMeteo() {
  const lat = CITIES.map((c) => c.lat).join(',');
  const lon = CITIES.map((c) => c.lon).join(',');
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code,wind_speed_10m,is_day' +
    '&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    '&timezone=auto&forecast_days=7';
  return getJSON(url).then((data) => (Array.isArray(data) ? data : [data]).map((d, i) => ({ ...CITIES[i], ...d })));
}

// wttr.in's codes (from WorldWeatherOnline) mapped onto the WMO codes Open-Meteo uses
function wmo(code) {
  const c = +code;
  if (c === 113) return 0;
  if (c === 116) return 2;
  if (c === 119 || c === 122) return 3;
  if ([143, 248, 260].includes(c)) return 45;
  if ([176, 263, 266, 293, 296].includes(c)) return 51;
  if ([299, 302, 305, 308, 353, 356, 359, 281, 284, 311, 314, 317, 320].includes(c)) return 61;
  if ([200, 386, 389, 392, 395].includes(c)) return 95;
  if (c >= 179 && c <= 377) return 71;
  return 2;
}

// the backup: wttr.in, one city at a time, reshaped to look like Open-Meteo's answer
function fromWttr() {
  return Promise.allSettled(CITIES.map((c) => getJSON(`https://wttr.in/${c.lat},${c.lon}?format=j1`, 10000))).then((all) => {
    const cities = all.map((r, i) => {
      if (r.status !== 'fulfilled') return null;
      const d = r.value;
      const city = CITIES[i];
      const local = new Date(Date.now() + city.offset * 1000).toISOString().slice(0, 16);
      const hour = +local.slice(11, 13);
      const now = d.current_condition[0];
      const hourly = d.weather.flatMap((day) =>
        day.hourly.map((h) => ({ time: `${day.date}T${String(+h.time / 100).padStart(2, '0')}:00`, t: +h.tempC, code: wmo(h.weatherCode) }))
      );
      return {
        ...city,
        utc_offset_seconds: city.offset,
        current: { time: local, temperature_2m: +now.temp_C, weather_code: wmo(now.weatherCode), wind_speed_10m: +now.windspeedKmph, is_day: hour >= 6 && hour < 18 ? 1 : 0 },
        hourly: { time: hourly.map((h) => h.time), temperature_2m: hourly.map((h) => h.t), weather_code: hourly.map((h) => h.code) },
        daily: {
          time: d.weather.map((w) => w.date),
          weather_code: d.weather.map((w) => wmo(w.hourly[4]?.weatherCode)),
          temperature_2m_max: d.weather.map((w) => +w.maxtempC),
          temperature_2m_min: d.weather.map((w) => +w.mintempC),
        },
      };
    });
    if (!cities[0]) throw new Error('no forecast');
    return cities.filter(Boolean);
  });
}

// the last good forecast, kept on this device for when both services are out of reach
const KEY = 'dev-desk-weather';
function saved() {
  try {
    const x = JSON.parse(localStorage.getItem(KEY));
    return x && Date.now() - x.at < 24 * 3600e3 ? x.cities : null;
  } catch {
    return null;
  }
}
function save(cities) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), cities }));
  } catch {
    // storage can be unavailable (private browsing); the forecast still shows this visit
  }
}

let request;
function load() {
  request ||= fromOpenMeteo()
    .catch(() => new Promise((ok) => setTimeout(ok, 1500)).then(fromOpenMeteo))
    .catch(fromWttr)
    .then((cities) => {
      save(cities);
      return cities;
    })
    .catch((err) => {
      const old = saved();
      if (old) return old;
      throw err;
    });
  return request;
}

export function useWeather() {
  const [state, setState] = useState(() => ({ cities: saved(), failed: false }));
  useEffect(() => {
    let alive = true;
    load()
      .then((cities) => alive && setState({ cities, failed: false }))
      .catch(() => {
        request = null;
        if (alive) setState({ cities: null, failed: true });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

// the city's own clock, from the UTC offset Open-Meteo returns
export function localTime(city) {
  const now = new Date(Date.now() + (city.utc_offset_seconds + new Date().getTimezoneOffset() * 60) * 1000);
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
