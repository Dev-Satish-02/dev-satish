import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Reveals `.reveal` and `.flash-in` elements as they scroll into view.
// Re-runs when `key` changes so client-side navigation picks up new elements.
export function useScrollReveal(key) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${(i % 4) * 60}ms`;
            entry.target.classList.add('show');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07 }
    );

    document.querySelectorAll('.reveal:not(.show), .flash-in:not(.show)').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [key]);
}

export function useActiveNav() {
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-hash]');

    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => link.classList.toggle('nav-active', link.dataset.hash === entry.target.id));
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((section) => navObs.observe(section));
    return () => {
      navObs.disconnect();
      navLinks.forEach((link) => link.classList.remove('nav-active'));
    };
  }, []);
}

// Router links to "/#section" don't scroll by themselves; this does, and resets
// scroll to the top on ordinary page changes.
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
