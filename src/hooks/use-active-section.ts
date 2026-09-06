'use client';

import { useSyncExternalStore } from 'react';

import type { SectionId } from '@/config/navigation';
import { SECTION_IDS } from '@/config/navigation';

/**
 * Which section the reader is in.
 *
 * One store for the whole page rather than a hook that sets up its own
 * observer per caller. Three components ask this question — the header, the
 * docked navigator and the hero scene — and three copies meant three sets of
 * listeners measuring the same thing on every scroll.
 *
 * The answer is measured from live geometry each time rather than accumulated
 * from `IntersectionObserver` entries. The previous version cached each
 * section's offset at the moment it crossed into an observed band and compared
 * those cached numbers afterwards, so a jump straight to a section left the one
 * above it holding the older, closer-looking value and winning the comparison:
 * clicking a link highlighted the section before it.
 */

/**
 * Distance below the top of the viewport at which a section counts as reached.
 * Just under the header, and matched to the scroll offset in `globals.css` so
 * that jumping to a section immediately marks that section.
 */
const ANCHOR_LINE = 96;

let activeId: SectionId | undefined;
let frame = 0;

const listeners = new Set<() => void>();

/** The last section whose top has passed the line; none while in the hero. */
function measure(): SectionId | undefined {
  let reached: SectionId | undefined;

  for (const id of SECTION_IDS) {
    const top = document.getElementById(id)?.getBoundingClientRect().top;

    if (top !== undefined && top <= ANCHOR_LINE) {
      reached = id;
    }
  }

  return reached;
}

function publish(): void {
  const next = measure();

  if (next === activeId) {
    return;
  }

  activeId = next;

  for (const listener of listeners) {
    listener();
  }
}

/** Coalesces a burst of scroll events into one measurement per frame. */
function schedule(): void {
  if (frame !== 0) {
    return;
  }

  frame = window.requestAnimationFrame(() => {
    frame = 0;
    publish();
  });
}

function subscribe(onStoreChange: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    publish();
  }

  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);

    if (listeners.size > 0) {
      return;
    }

    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    window.cancelAnimationFrame(frame);
    frame = 0;
  };
}

function getSnapshot(): SectionId | undefined {
  return activeId;
}

/*
 * Nothing is active on the server: at the top of the page the reader is in the
 * hero, and marking the first link there would be a lie about where they are.
 */
function getServerSnapshot(): SectionId | undefined {
  return undefined;
}

export function useActiveSection(): SectionId | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
