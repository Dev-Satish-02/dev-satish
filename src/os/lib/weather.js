import { useEffect, useState } from 'react';

// Live weather from Open-Meteo (free, no key, CORS-friendly), fetched once per visit.
export const CITIES = [
  { name: 'Pilani', lat: 28.37, lon: 75.6 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59 },
  { name: 'San Francisco', lat: 37.77, lon: -122.42 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'New York', lat: 40.71, lon: -74.01 },
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

let request;
function load() {
  const lat = CITIES.map((c) => c.lat).join(',');
  const lon = CITIES.map((c) => c.lon).join(',');
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code,wind_speed_10m,is_day' +
    '&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    '&timezone=auto&forecast_days=7';
  request ||= fetch(url)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((data) => (Array.isArray(data) ? data : [data]).map((d, i) => ({ ...CITIES[i], ...d })));
  return request;
}

export function useWeather() {
  const [state, setState] = useState({ cities: null, failed: false });
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
