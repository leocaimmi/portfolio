'use client';

import { useSyncExternalStore } from 'react';

import type { SectionId } from '@/config/navigation';
import { getActiveSection, getServerSection, subscribeToSection } from '@/lib/reading-position';

/**
 * Which section the reader is in.
 *
 * A view onto the page-wide reading position rather than a measurement of its
 * own, and subscribed in a way that re-renders only when the answer changes:
 * the store notifies this channel on a section boundary, not on a frame.
 */
export function useActiveSection(): SectionId | undefined {
  return useSyncExternalStore(subscribeToSection, getActiveSection, getServerSection);
}
