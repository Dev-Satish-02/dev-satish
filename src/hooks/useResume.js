import { useEffect, useState } from 'react';
import { PROFILE } from '../data/content';
import { fileExists } from './usePortfolioEffects';

const href = PROFILE.resume ? `${import.meta.env.BASE_URL}${PROFILE.resume}` : null;
let check; // one shared request for every button on the page

// The résumé link only shows once public/resume.pdf actually exists.
export default function useResume() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!href) return undefined;
    check ||= fileExists(href);
    let alive = true;
    check.then((exists) => alive && setOk(exists));
    return () => {
      alive = false;
    };
  }, []);
  return ok ? href : null;
}
