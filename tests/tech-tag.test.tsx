import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TechTagList } from '@/components/ui/tech-tag';

describe('TechTagList', () => {
  it('resolves each id to its registered display name', () => {
    render(<TechTagList items={['spring-boot', 'postgresql']} />);

    expect(screen.getByText('Spring Boot')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  /*
   * Marked up as a real list so assistive technology can announce how many
   * technologies a project uses, rather than reading a run of loose text.
   */
  it('renders a list with one item per technology', () => {
    render(<TechTagList items={['java', 'react', 'docker']} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('falls back to a monogram when a technology has no brand mark', () => {
    render(<TechTagList items={['row-level-security']} />);

    expect(screen.getByText('Row Level Security')).toBeInTheDocument();
    expect(screen.getByText('RLS')).toBeInTheDocument();
  });

  it('keeps a short name whole in the monogram rather than clipping it', () => {
    render(<TechTagList items={['sql']} />);

    expect(screen.getByText('SQL', { selector: 'span' })).toBeInTheDocument();
  });

  it('renders nothing at all for an empty stack', () => {
    const { container } = render(<TechTagList items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
