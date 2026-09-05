'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onStoreChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', onStoreChange);

  return () => {
    media.removeEventListener('change', onStoreChange);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * The server cannot know the visitor's preference, so it assumes the calmer
 * option. A motion-sensitive visitor therefore never sees a frame of animation
 * before hydration corrects it; everyone else gets the animation a tick later.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Tracks the operating system's reduced-motion setting and re-renders when it
 * changes, so the preference can be toggled without a reload.
 *
 * CSS already neutralises declarative animation globally. This hook exists for
 * the cases CSS cannot reach: canvas render loops and JavaScript-driven motion.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
