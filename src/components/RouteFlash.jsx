import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFullMotion } from '../lib/store';

// A single black cut when the page changes, like a scene change.
export default function RouteFlash() {
  const { pathname } = useLocation();
  const motion = useFullMotion();
  const first = useRef(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setKey((k) => k + 1);
  }, [pathname]);

  if (!key || !motion) return null;
  return <div key={key} className="route-flash" aria-hidden="true" />;
}
