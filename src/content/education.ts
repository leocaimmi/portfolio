import type { Education } from './schemas';

/**
 * Formal education, newest first. Entries without a period sort last.
 */
export const education: Education[] = [
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
    id: 'cem-english',
    institution: 'CEM',
    title: {
      es: 'Inglés · Nivel 3',
      en: 'English · Level 3',
    },
    kind: 'language',
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
