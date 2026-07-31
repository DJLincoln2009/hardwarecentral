import type { Product } from '@/types';
import { hpeProducts } from './products/hpe';
import { hpProducts } from './products/hp';
import { dellProducts } from './products/dell';
import { fortinetProducts } from './products/fortinet';
import { ciscoProducts } from './products/cisco';
import { huaweiProducts } from './products/huawei';
import { hikvisionProducts } from './products/hikvision';

export const products: Product[] = [
  ...hpeProducts,
  ...hpProducts,
  ...dellProducts,
  ...fortinetProducts,
  ...ciscoProducts,
  ...huaweiProducts,
  ...hikvisionProducts,
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((p) => p.brand === brand);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}
