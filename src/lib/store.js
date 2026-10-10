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

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the choice just won't persist */
  }
}

const reducedMotionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

// Motion is "full" unless the OS asks for reduced motion or the visitor switched it off in the header.
export const motionPref = createStore(readStorage('devogatari:motion') || 'on');
export const systemReducedMotion = createStore(Boolean(reducedMotionQuery?.matches));
reducedMotionQuery?.addEventListener('change', (e) => systemReducedMotion.set(e.matches));

export function setMotion(value) {
  motionPref.set(value);
  writeStorage('devogatari:motion', value);
}

export function fullMotion() {
  return motionPref.get() === 'on' && !systemReducedMotion.get();
}

export function useFullMotion() {
  const pref = useStore(motionPref);
  const reduced = useStore(systemReducedMotion);
  return pref === 'on' && !reduced;
}

// Which season's weather is on screen: spring | summer | autumn | winter | rain | finale
export const activeSeason = createStore('spring');

// Loading progress of the 3D stage (0..1) and whether the site is past the loader.
export const stageProgress = createStore(0);
export const introDone = createStore(false);
