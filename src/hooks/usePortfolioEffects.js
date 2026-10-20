import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Reveals `.reveal` elements as they scroll into view. Re-runs when `key` changes.
export function useScrollReveal(key) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(i % 4) * 70}ms`;
            entry.target.classList.add('show');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal:not(.show)').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [key]);
}

export function useActiveNav() {
  useEffect(() => {
    const sections = [...document.querySelectorAll('main > section[id]')];
    const links = () => document.querySelectorAll('.nav-link[data-hash]');
    // the active section is the last one whose top has passed the middle of the screen,
    // so the seams between sections keep the one just scrolled through
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      const current = sections.filter((s) => s.getBoundingClientRect().top <= mid).pop();
      links().forEach((l) => l.classList.toggle('is-active', l.dataset.hash === current?.id));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      links().forEach((l) => l.classList.remove('is-active'));
    };
  }, []);
}

// Router links to "/#section" don't scroll on their own; this does, and resets scroll on page changes.
export function useScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
}

// Résumé link only shows once public/resume.pdf actually exists.
export async function fileExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok && !(res.headers.get('content-type') || '').includes('text/html');
  } catch {
    return false;
  }
}
