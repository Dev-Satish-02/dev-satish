import { useState } from 'react';
import { describe, localTime, useWeather } from '../lib/weather';

/* Weather, with live forecasts from Open-Meteo. Pilani first, since that's where Dev is. */

const round = (n) => Math.round(n);

function Detail({ city }) {
  const now = describe(city.current.weather_code);
  const hi = city.daily.temperature_2m_max[0];
  const lo = city.daily.temperature_2m_min[0];
  // the next twelve hours from the city's current hour
  const start = city.hourly.time.findIndex((t) => t >= city.current.time.slice(0, 13));
  const hours = city.hourly.time.slice(Math.max(0, start), Math.max(0, start) + 12);
  const weekLo = Math.min(...city.daily.temperature_2m_min);
  const weekHi = Math.max(...city.daily.temperature_2m_max);
  return (
    <div className={`wx-detail${city.current.is_day ? '' : ' is-night'}`}>
      <header className="wx-hero">
        <h2>{city.name}</h2>
        <strong>{round(city.current.temperature_2m)}°</strong>
        <p>
          {now.icon} {now.label}
        </p>
        <p>
          H:{round(hi)}° L:{round(lo)}°
        </p>
      </header>
      <p className="wx-card wx-note">
        {now.label} now, with winds around {round(city.current.wind_speed_10m)} km/h. Today runs from {round(lo)}° to {round(hi)}°.
      </p>
      <section className="wx-card">
        <h3>Hourly forecast</h3>
        <ol className="wx-hours">
          {hours.map((t, i) => {
            const k = start + i;
            return (
              <li key={t}>
                <span>{i === 0 ? 'Now' : new Date(t).toLocaleTimeString('en-US', { hour: 'numeric' })}</span>
                <span aria-hidden="true">{describe(city.hourly.weather_code[k]).icon}</span>
                <b>{round(city.hourly.temperature_2m[k])}°</b>
              </li>
            );
          })}
        </ol>
      </section>
      <section className="wx-card">
        <h3>7-day forecast</h3>
        <ol className="wx-days">
          {city.daily.time.map((t, i) => {
            const a = city.daily.temperature_2m_min[i];
            const b = city.daily.temperature_2m_max[i];
            const span = weekHi - weekLo || 1;
            return (
              <li key={t}>
                <span>{i === 0 ? 'Today' : new Date(t).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span aria-hidden="true">{describe(city.daily.weather_code[i]).icon}</span>
                <span className="wx-lo">{round(a)}°</span>
                <span className="wx-range">
                  <i style={{ left: `${((a - weekLo) / span) * 100}%`, right: `${100 - ((b - weekLo) / span) * 100}%` }} />
                </span>
                <span>{round(b)}°</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export default function WeatherApp({ layout, onClose }) {
  const { cities, failed } = useWeather();
  const [pick, setPick] = useState(0);
  const [q, setQ] = useState('');
  const phone = layout === 'phone';
  const nav = phone && (
    <div className="ph-nav">
      <button type="button" className="ph-back" onClick={onClose}>
        <span aria-hidden="true">‹</span> Home
      </button>
    </div>
  );
  if (!cities) {
    return (
      <div className={`wx wx-wait${phone ? ' ph-app ph-weather' : ''}`}>
        {nav}
        {failed ? 'The forecast service didn’t answer. Try again in a moment.' : 'Loading forecasts…'}
      </div>
    );
  }
  if (phone) {
    // on a phone: the forecast full screen, with the cities as a row of chips to switch between
    return (
      <div className="ph-app ph-weather">
        {nav}
        <div className="wx-chips" role="tablist" aria-label="Cities">
          {cities.map((c, i) => (
            <button key={c.name} type="button" role="tab" aria-selected={i === pick} className={i === pick ? 'is-on' : undefined} onClick={() => setPick(i)}>
              {c.name} {Math.round(c.current.temperature_2m)}°
            </button>
          ))}
        </div>
        <Detail city={cities[pick]} />
      </div>
    );
  }
  const shown = cities.map((c, i) => [c, i]).filter(([c]) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="wx">
      <aside className="wx-side">
        <label className="notes-search">
          <input type="search" placeholder="Search for a city" aria-label="Search cities" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <ul>
          {shown.map(([c, i]) => {
            const d = describe(c.current.weather_code);
            return (
              <li key={c.name}>
                <button type="button" className={`wx-city${i === pick ? ' is-current' : ''}`} onClick={() => setPick(i)}>
                  <span className="wx-city-top">
                    <strong>{c.name}</strong>
                    <b>{round(c.current.temperature_2m)}°</b>
                  </span>
                  <span className="wx-city-sub">{localTime(c)}</span>
                  <span className="wx-city-top wx-city-sub">
                    <span>{d.label}</span>
                    <span>
                      H:{round(c.daily.temperature_2m_max[0])}° L:{round(c.daily.temperature_2m_min[0])}°
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <Detail city={cities[pick]} />
    </div>
  );
}
