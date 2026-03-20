import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentReadingHeroPanel } from '../components/CurrentReadingHeroPanel';
import { renderWithProviders } from '../../../test/renderWithProviders';

describe('CurrentReadingHeroPanel', () => {
  it('renders ranked featured books with reader counts', () => {
    renderWithProviders(
      <CurrentReadingHeroPanel
        items={[
          { rank: 1, bookTitle: 'Dune', readerCount: 4 },
          { rank: 2, bookTitle: 'Hyperion', readerCount: 3 },
          { rank: 3, bookTitle: 'The Hobbit', readerCount: 2 },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: /top current reads/i })).toBeInTheDocument();
    expect(screen.getByText(/#1/i)).toBeInTheDocument();
    expect(screen.getByText(/dune/i)).toBeInTheDocument();
    expect(screen.getByText(/4 readers currently/i)).toBeInTheDocument();
  });

  it('renders an empty state when no featured books are available', () => {
    renderWithProviders(<CurrentReadingHeroPanel items={[]} />);

    expect(screen.getByText(/no featured current reads yet/i)).toBeInTheDocument();
  });

  it('renders a fallback message when featured books cannot be loaded', () => {
    renderWithProviders(<CurrentReadingHeroPanel items={[]} hasError />);

    expect(screen.getByText(/featured books are unavailable right now/i)).toBeInTheDocument();
  });
});

