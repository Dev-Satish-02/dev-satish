import Scene from './Scene';
import Petals from './Petals';
import { PROFILE } from '../data/content';

// The cherry-blossom hero: used when a device can't run the 3D staircase, and kept so we
// can switch back to it.
export default function HeroBlossom() {

  return (
    <Scene id="about" season="spring" className="hero" backdrop={<Petals />}>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-name hero-in" style={{ '--i': 1 }}>
            {PROFILE.name}
          </h1>
          <p className="hero-role hero-in" style={{ '--i': 2 }}>
            {PROFILE.title}
          </p>
          <p className="hero-summary hero-in" style={{ '--i': 3 }}>
            {PROFILE.summary}
          </p>
        </div>
      </div>
    </Scene>
  );
}
