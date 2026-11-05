import { useSyncExternalStore } from 'react';

// Tiny observable store, so non-React code (canvas loops, three.js) can share state with components.
export function createStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set(next) {
      const v = typeof next === 'function' ? next(value) : next;
      if (Object.is(v, value)) return;
      value = v;
      listeners.forEach((l) => l(value));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

const reducedMotionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

// Full motion unless the visitor's OS asks for reduced motion.
export const systemReducedMotion = createStore(Boolean(reducedMotionQuery?.matches));
reducedMotionQuery?.addEventListener('change', (e) => systemReducedMotion.set(e.matches));

export function fullMotion() {
  return !systemReducedMotion.get();
}

export function useFullMotion() {
  return !useStore(systemReducedMotion);
}

// Loading progress of the 3D stage (0..1) and whether the site is past the loader.
export const stageProgress = createStore(0);
export const introDone = createStore(false);
