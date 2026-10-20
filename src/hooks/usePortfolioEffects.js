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
    const sections = document.querySelectorAll('section[id]');
    const links = () => document.querySelectorAll('.nav-link[data-hash]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links().forEach((l) => l.classList.toggle('is-active', l.dataset.hash === entry.target.id));
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      io.disconnect();
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
