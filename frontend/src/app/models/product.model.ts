export type ProductType = 'DRINK' | 'SNACK' | 'OTHER';

export const PRODUCT_TYPES: ProductType[] = ['DRINK', 'SNACK', 'OTHER'];

// max 15 items per product slot
export const MAX_QUANTITY = 15;

export interface Product {
  id: number;
  name: string;
  type: ProductType;
  priceCents: number; // price in cents, so we don't have to deal with rounding
  quantity: number;
}

export interface NewProductInput {
  name: string;
  type: ProductType;
  priceCents: number;
  quantity: number;
}
