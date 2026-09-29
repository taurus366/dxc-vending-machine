import { Injectable, inject, signal } from '@angular/core';
import { ACCEPTED_COIN_VALUES } from '../models/coin.model';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

export interface ChangeCoin {
  valueCents: number;
  count: number;
}

export type PurchaseResult =
  | { success: true; changeCents: number; change: ChangeCoin[] }
  | { success: false; reason: 'OUT_OF_STOCK' }
  | { success: false; reason: 'INSUFFICIENT_FUNDS'; missingCents: number };

export interface ReturnResult {
  returnedCents: number;
  change: ChangeCoin[];
}

// Keeps track of how much money is currently inserted, and handles buying / giving money back.
// Product stock itself lives in ProductService - we just tell it to take one off the shelf.
@Injectable({ providedIn: 'root' })
export class VendingService {
  private readonly productService = inject(ProductService);

  private readonly _insertedCents = signal(0);
  readonly insertedCents = this._insertedCents.asReadonly();

  insertCoin(valueCents: number): boolean {
    if (!ACCEPTED_COIN_VALUES.includes(valueCents)) {
      return false;
    }
    this._insertedCents.update((v) => v + valueCents);
    return true;
  }

  buy(product: Product): PurchaseResult {
    if (product.quantity <= 0) {
      return { success: false, reason: 'OUT_OF_STOCK' };
    }
    const balance = this._insertedCents();
    if (balance < product.priceCents) {
      return { success: false, reason: 'INSUFFICIENT_FUNDS', missingCents: product.priceCents - balance };
    }

    const changeCents = balance - product.priceCents;
    this.productService.decrementQuantity(product.id);
    this._insertedCents.set(0);

    return { success: true, changeCents, change: this.makeChange(changeCents) };
  }

  // give the customer their money back without buying anything
  reset(): ReturnResult {
    const returnedCents = this._insertedCents();
    this._insertedCents.set(0);
    return { returnedCents, change: this.makeChange(returnedCents) };
  }

  // gives change using the biggest coins first, e.g. 70c -> one 50c + one 20c
  private makeChange(amountCents: number): ChangeCoin[] {
    const coinsBiggestFirst = [...ACCEPTED_COIN_VALUES].sort((a, b) => b - a);
    const result: ChangeCoin[] = [];
    let remaining = amountCents;

    for (const coin of coinsBiggestFirst) {
      const count = Math.floor(remaining / coin);
      if (count > 0) {
        result.push({ valueCents: coin, count });
        remaining -= coin * count;
      }
    }

    return result;
  }
}
