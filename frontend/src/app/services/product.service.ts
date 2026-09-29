import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { MAX_QUANTITY, NewProductInput, Product } from '../models/product.model';

// Fetches the starting product list from the backend once.
// After that, add/edit/delete just change this list in memory - nothing gets sent back to the server.
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _loadError = signal<string | null>(null);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadError = this._loadError.asReadonly();
  readonly isEmpty = computed(() => this._products().length === 0);

  private nextLocalId = -1;

  loadInitialProducts(): void {
    this._loading.set(true);
    this._loadError.set(null);
    this.http
      .get<Product[]>(`${API_BASE_URL}/products`)
      .pipe(
        tap((products) => this._products.set(products)),
        catchError((err) => {
          console.error('Failed to load initial products', err);
          this._loadError.set(
            'Could not reach the mocked products API. Is the backend running on http://localhost:8080?',
          );
          return of([] as Product[]);
        }),
      )
      .subscribe(() => this._loading.set(false));
  }

  getById(id: number): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  addProduct(input: NewProductInput): { ok: true } | { ok: false; error: string } {
    const validation = this.validate(input.name, input.priceCents, input.quantity);
    if (!validation.ok) {
      return validation;
    }
    const product: Product = {
      id: this.nextLocalId--,
      name: input.name.trim(),
      type: input.type,
      priceCents: input.priceCents,
      quantity: input.quantity,
    };
    this._products.update((list) => [...list, product]);
    return { ok: true };
  }

  updateProduct(
    id: number,
    changes: NewProductInput,
  ): { ok: true } | { ok: false; error: string } {
    const validation = this.validate(changes.name, changes.priceCents, changes.quantity);
    if (!validation.ok) {
      return validation;
    }
    this._products.update((list) =>
      list.map((p) =>
        p.id === id
          ? {
              ...p,
              name: changes.name.trim(),
              type: changes.type,
              priceCents: changes.priceCents,
              quantity: changes.quantity,
            }
          : p,
      ),
    );
    return { ok: true };
  }

  deleteProduct(id: number): void {
    this._products.update((list) => list.filter((p) => p.id !== id));
  }

  // called after a successful purchase to take one item off the shelf
  decrementQuantity(id: number): void {
    this._products.update((list) =>
      list.map((p) => (p.id === id && p.quantity > 0 ? { ...p, quantity: p.quantity - 1 } : p)),
    );
  }

  private validate(
    name: string,
    priceCents: number,
    quantity: number,
  ): { ok: true } | { ok: false; error: string } {
    if (!name || !name.trim()) {
      return { ok: false, error: 'Product name is required.' };
    }
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      return { ok: false, error: 'Price must be greater than 0.' };
    }
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
      return { ok: false, error: `Quantity must be between 0 and ${MAX_QUANTITY}.` };
    }
    return { ok: true };
  }
}
