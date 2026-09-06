import type { SectionId } from '@/config/navigation';
import { SECTION_IDS } from '@/config/navigation';

/**
 * Where the reader is on the page, measured once per frame for the whole site.
 *
 * Three things follow the scroll — the header, the docked navigator and the
 * hero scene — and each used to do its own listening, its own measuring and,
 * in one case, its own React state update per frame. On a smooth jump across
 * the page that is several hundred renders and several thousand forced layouts
 * to move a readout by ten metres.
 *
 * So: one listener, one frame, one measurement. Geometry that only changes when
 * the page does is cached and refreshed by a `ResizeObserver` rather than read
 * back on every frame, because reading layout while the page is scrolling is
 * what turns a scroll into a stutter.
 *
 * Two kinds of subscriber, deliberately kept apart. Frame subscribers are
 * imperative and hear every frame; they write to the DOM themselves. State
 * subscribers are React and hear only when the answer actually changes.
 */

/**
 * Distance below the top of the viewport at which a section counts as reached.
 * Just under the header, and matched to the scroll offset in `globals.css` so
 * that jumping to a section immediately marks that section.
 */
const ANCHOR_LINE = 96;

export interface ReadingPosition {
  scrollY: number;
  /** How far through the scrollable page, 0 to 1. */
  progress: number;
  viewportHeight: number;
  activeId: SectionId | undefined;
}

interface SectionTop {
  id: SectionId;
  /** Distance from the top of the document, not of the viewport. */
  top: number;
}

let sectionTops: SectionTop[] = [];
let travel = 0;
let viewportHeight = 0;

let scrollY = 0;
let activeId: SectionId | undefined;

let frame = 0;
let observer: ResizeObserver | undefined;

const frameListeners = new Set<(position: ReadingPosition) => void>();
const stateListeners = new Set<() => void>();

function position(): ReadingPosition {
  return {
    scrollY,
    progress: travel > 0 ? Math.min(1, scrollY / travel) : 0,
    viewportHeight,
    activeId,
  };
}

/** The only place layout is read. Called on setup and whenever the page resizes. */
function remeasure(): void {
  const offset = window.scrollY;

  viewportHeight = window.innerHeight;
  travel = document.documentElement.scrollHeight - viewportHeight;
  sectionTops = SECTION_IDS.flatMap((id) => {
    const element = document.getElementById(id);

    return element ? [{ id, top: element.getBoundingClientRect().top + offset }] : [];
  });
}

/** The last section whose top has passed the line; none while in the hero. */
function sectionAt(offset: number): SectionId | undefined {
  const line = offset + ANCHOR_LINE;
  let reached: SectionId | undefined;

  for (const section of sectionTops) {
    if (section.top <= line) {
      reached = section.id;
    }
  }

  return reached;
}

function publish(): void {
  scrollY = window.scrollY;

  const next = sectionAt(scrollY);
  const changed = next !== activeId;

  activeId = next;

  const reading = position();

  for (const listener of frameListeners) {
    listener(reading);
  }

  if (!changed) {
    return;
  }

  for (const listener of stateListeners) {
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

function handleResize(): void {
  remeasure();
  publish();
}

function start(): void {
  remeasure();
  publish();

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', handleResize);

  // The page changes height on its own — fonts land, panels reveal, an image
  // arrives — and stale section offsets mark the wrong section.
  observer = new ResizeObserver(handleResize);
  observer.observe(document.documentElement);
}

function stop(): void {
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', handleResize);
  observer?.disconnect();
  observer = undefined;

  window.cancelAnimationFrame(frame);
  frame = 0;
}

function attach<T>(listeners: Set<T>, listener: T): () => void {
  const isFirst = frameListeners.size + stateListeners.size === 0;

  listeners.add(listener);

  if (isFirst) {
    start();
  }

  return () => {
    listeners.delete(listener);

    if (frameListeners.size + stateListeners.size === 0) {
      stop();
    }
  };
}

/** Every frame the reader moves. For code that writes to the DOM directly. */
export function subscribeToFrames(listener: (reading: ReadingPosition) => void): () => void {
  const detach = attach(frameListeners, listener);

  listener(position());

  return detach;
}

/** Only when the section under the reader changes. For React. */
export function subscribeToSection(listener: () => void): () => void {
  return attach(stateListeners, listener);
}

export function getActiveSection(): SectionId | undefined {
  return activeId;
}

/*
 * Nothing is active on the server: at the top of the page the reader is in the
 * hero, and marking the first link there would be a lie about where they are.
 */
export function getServerSection(): SectionId | undefined {
  return undefined;
}
