import type { Education } from './schemas';

/** Formal education and certifications, newest first. */
export const education: Education[] = [
  {
    id: 'english-level-3',
    institution: 'CEM English',
    title: {
      es: 'Inglés — Curso regular, nivel 3',
      en: 'English — Regular course, level 3',
    },
    kind: 'language',
    period: { start: '2026-03', end: null },
  },
  {
    id: 'english-intensive-2',
    institution: 'CEM English',
    title: {
      es: 'Inglés — 2.º curso intensivo',
      en: 'English — 2nd intensive course',
    },
    kind: 'language',
    period: { start: '2025-08', end: '2025-12' },
  },
  {
    id: 'english-intensive-1',
    institution: 'CEM English',
    title: {
      es: 'Inglés — 1.er curso intensivo',
      en: 'English — 1st intensive course',
    },
    kind: 'language',
    period: { start: '2025-03', end: '2025-07' },
  },
  {
    id: 'spring-boot',
    institution: 'UTN FRMDP',
    title: {
      es: 'Curso de Spring Boot',
      en: 'Spring Boot course',
    },
    kind: 'course',
    period: { start: '2024-09', end: '2024-12' },
  },
  {
    id: 'programming-degree',
    institution: 'UTN FRMDP',
    title: {
      es: 'Tecnicatura Universitaria en Programación',
      en: 'University Technical Degree in Programming',
    },
    kind: 'degree',
    period: { start: '2023-02', end: '2024-12' },
  },
];
