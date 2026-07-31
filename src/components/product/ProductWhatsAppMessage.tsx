'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores/ui-store';

interface Props {
  productName: string;
  sku: string;
}

function ProductWhatsAppMessage({ productName, sku }: Props) {
  const setWhatsappMessage = useUIStore((s) => s.setWhatsappMessage);

  useEffect(() => {
    const message = `Bonjour HardwareCentral, je souhaite avoir plus d'informations sur le produit ${productName} (SKU: ${sku}).`;
    setWhatsappMessage(message);
    return () => setWhatsappMessage(null);
  }, [productName, sku, setWhatsappMessage]);

  return null;
}

export default ProductWhatsAppMessage;
