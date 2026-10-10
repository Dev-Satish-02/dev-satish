import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// A red → black blink whenever the page changes, like the series' "blink" cuts.
export default function RouteFlash() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setKey((k) => k + 1);
  }, [pathname]);

  if (key === 0) return null;
  return <div key={key} className="route-flash" aria-hidden="true" />;
}
