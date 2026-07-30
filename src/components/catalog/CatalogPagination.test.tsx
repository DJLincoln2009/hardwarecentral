import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalogPagination from './CatalogPagination';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/catalogue',
}));

describe('CatalogPagination', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = render(<CatalogPagination currentPage={1} totalPages={1} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders pagination when totalPages > 1', () => {
    render(<CatalogPagination currentPage={1} totalPages={3} />);
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
    expect(screen.getByLabelText('Page précédente')).toBeInTheDocument();
    expect(screen.getByLabelText('Page suivante')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<CatalogPagination currentPage={2} totalPages={5} />);
    const currentBtn = screen.getByText('2');
    expect(currentBtn).toHaveAttribute('aria-current', 'page');
  });

  it('disables prev button on first page', () => {
    render(<CatalogPagination currentPage={1} totalPages={5} />);
    expect(screen.getByLabelText('Page précédente')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<CatalogPagination currentPage={5} totalPages={5} />);
    expect(screen.getByLabelText('Page suivante')).toBeDisabled();
  });
});
