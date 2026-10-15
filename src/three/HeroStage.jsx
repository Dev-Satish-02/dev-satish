import { useEffect, useRef } from 'react';
import { createStage } from './stage';
import { MODEL } from '../data/content';
import { stageProgress } from '../lib/store';

export default function HeroStage({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    let stage;
    try {
      stage = createStage(ref.current, MODEL, url);
    } catch (err) {
      console.warn('[stage] WebGL unavailable', err);
      stageProgress.set(1);
    }
    return () => stage?.dispose();
  }, [url]);

  return <div ref={ref} className="portal-stage" />;
}
