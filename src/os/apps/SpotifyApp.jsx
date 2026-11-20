import { useState } from 'react';
import { AVATAR, SPOTIFY } from '../../data/content';
import { AppIcon } from '../icons';

/* Spotify: Dev's profile and public playlists. Picking one loads Spotify's own embedded player,
   which plays previews for anyone and full tracks for listeners signed in to Spotify. */

const base = import.meta.env.BASE_URL;
const cover = (p) => `${base}images/spotify/${p.id}.jpg`;
const link = (p) => `https://open.spotify.com/playlist/${p.id}`;

function Player({ playlist, compact }) {
  return (
    <iframe
      key={playlist.id}
      className="sp-player"
      title={`${playlist.title} on Spotify`}
      src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`}
      height={compact ? 352 : 420}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

export default function SpotifyApp({ layout, onClose }) {
  const phone = layout === 'phone';
  const [pick, setPick] = useState(null);
  const playing = SPOTIFY.playlists.find((p) => p.id === pick);

  const header = (
    <header className="sp-hero">
      <img className="sp-avatar" src={`${base}${AVATAR}`} alt="" />
      <div>
        <p className="sp-kind">Profile</p>
        <h2>{SPOTIFY.name}</h2>
        <p className="sp-sub">{SPOTIFY.playlists.length} Public Playlists</p>
        <a className="sp-open" href={SPOTIFY.profile} target="_blank" rel="noreferrer">
          Open in Spotify ↗
        </a>
      </div>
    </header>
  );

  const grid = (
    <ul className="sp-grid">
      {SPOTIFY.playlists.map((p) => (
        <li key={p.id}>
          <button type="button" className={`sp-card${p.id === pick ? ' is-on' : ''}`} onClick={() => setPick(p.id)}>
            <img src={cover(p)} alt="" loading="lazy" />
            <strong>{p.title}</strong>
            <span>By {SPOTIFY.name}</span>
            <i className="sp-play" aria-hidden="true">
              ▶
            </i>
          </button>
        </li>
      ))}
    </ul>
  );

  if (phone) {
    return (
      <div className="ph-app ph-spotify sp">
        <div className="ph-nav">
          <button type="button" className="ph-back" onClick={playing ? () => setPick(null) : onClose}>
            <span aria-hidden="true">‹</span> {playing ? 'Playlists' : 'Home'}
          </button>
        </div>
        {playing ? (
          <div className="sp-phone-play">
            <Player playlist={playing} compact />
            <a className="sp-open" href={link(playing)} target="_blank" rel="noreferrer">
              Open in Spotify ↗
            </a>
          </div>
        ) : (
          <>
            {header}
            <h3 className="sp-section">Public Playlists</h3>
            {grid}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="sp">
      <aside className="sp-side">
        <p className="sp-side-title">
          <AppIcon id="spotify" /> Your Library
        </p>
        <ul>
          {SPOTIFY.playlists.map((p) => (
            <li key={p.id}>
              <button type="button" className={p.id === pick ? 'is-on' : undefined} onClick={() => setPick(p.id)}>
                <img src={cover(p)} alt="" loading="lazy" />
                <span>
                  <strong>{p.title}</strong>
                  <em>Playlist · {SPOTIFY.name}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="sp-main">
        {header}
        {playing && <Player playlist={playing} />}
        <h3 className="sp-section">Public Playlists</h3>
        {grid}
      </div>
    </div>
  );
}
