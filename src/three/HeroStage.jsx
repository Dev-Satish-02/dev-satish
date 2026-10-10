import { useEffect, useRef } from 'react';
import { createStage } from './stage';
import { MODEL } from '../data/content';
import { stageProgress } from '../lib/store';

export default function HeroStage({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    let stage;
    try {
      stage = createStage(ref.current, MODEL);
    } catch (err) {
      // no WebGL: the scene illustration carries the hero on its own
      console.warn('[stage] WebGL unavailable', err);
      stageProgress.set(1);
    }
    return () => stage?.dispose();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      tabIndex={0}
      role="img"
      aria-label="3D figure of Dev Satish. Hover or focus to tilt its head."
      data-cursor="tilt"
    />
  );
}
