import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteToggleButton from './QuoteToggleButton';
import { useQuoteStore } from '@/lib/stores/quote-store';
import { ToastProvider } from '@/components/ui/Toast';

const mockProduct = { id: 'test-1', sku: 'SKU001', name: 'Test Product', brand: 'HPE' as const };

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('QuoteToggleButton', () => {
  beforeEach(() => {
    useQuoteStore.setState({ items: [] });
  });

  it('renders add to quote when not in quote list', () => {
    renderWithProviders(<QuoteToggleButton product={mockProduct} />);
    expect(screen.getByText('Ajouter au devis')).toBeInTheDocument();
  });

  it('renders remove from quote when already in quote list', () => {
    useQuoteStore.setState({
      items: [{ productId: 'test-1', sku: 'SKU001', name: 'Test Product', brand: 'HPE' }],
    });
    renderWithProviders(<QuoteToggleButton product={mockProduct} />);
    expect(screen.getByText('Ajouté ✓')).toBeInTheDocument();
  });

  it('toggles quote state on click', async () => {
    renderWithProviders(<QuoteToggleButton product={mockProduct} />);
    const btn = screen.getByText('Ajouter au devis');
    await userEvent.click(btn);
    expect(useQuoteStore.getState().items.some((i) => i.productId === 'test-1')).toBe(true);
  });

  it('removes from quote on second click', async () => {
    useQuoteStore.setState({
      items: [{ productId: 'test-1', sku: 'SKU001', name: 'Test Product', brand: 'HPE' }],
    });
    renderWithProviders(<QuoteToggleButton product={mockProduct} />);
    const btn = screen.getByText('Ajouté ✓');
    await userEvent.click(btn);
    expect(useQuoteStore.getState().items.some((i) => i.productId === 'test-1')).toBe(false);
  });
});
