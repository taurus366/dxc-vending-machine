import { Component, inject, signal } from '@angular/core';
import { CurrencyCentsPipe } from '../../core/currency-cents.pipe';
import { ACCEPTED_COINS } from '../../models/coin.model';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ChangeCoin, VendingService } from '../../services/vending.service';

interface Feedback {
  kind: 'success' | 'error' | 'info';
  text: string;
}

@Component({
  selector: 'app-vending-machine',
  imports: [CurrencyCentsPipe],
  templateUrl: './vending-machine.html',
  styleUrl: './vending-machine.css',
})
export class VendingMachine {
  private readonly productService = inject(ProductService);
  private readonly vendingService = inject(VendingService);

  readonly products = this.productService.products;
  readonly loading = this.productService.loading;
  readonly loadError = this.productService.loadError;
  readonly balanceCents = this.vendingService.insertedCents;
  readonly coins = ACCEPTED_COINS;

  readonly feedback = signal<Feedback | null>(null);

  insertCoin(valueCents: number): void {
    this.vendingService.insertCoin(valueCents);
    this.feedback.set(null);
  }

  buy(product: Product): void {
    const result = this.vendingService.buy(product);

    if (result.success) {
      const changeText = result.changeCents > 0 ? ` Change returned: ${this.describeChange(result.change)}.` : '';
      this.feedback.set({
        kind: 'success',
        text: `Enjoy your ${product.name}!${changeText}`,
      });
      return;
    }

    if (result.reason === 'OUT_OF_STOCK') {
      this.feedback.set({ kind: 'error', text: `${product.name} is out of stock.` });
      return;
    }

    this.feedback.set({
      kind: 'error',
      text: `Insufficient funds - insert €${(result.missingCents / 100).toFixed(2)} more to buy ${product.name}.`,
    });
  }

  resetMachine(): void {
    const result = this.vendingService.reset();
    if (result.returnedCents === 0) {
      this.feedback.set({ kind: 'info', text: 'No coins to return.' });
      return;
    }
    this.feedback.set({
      kind: 'info',
      text: `Returned: ${this.describeChange(result.change)}.`,
    });
  }

  private describeChange(change: ChangeCoin[]): string {
    return change
      .map((c) => `${c.count} x ${c.valueCents >= 100 ? '€' + c.valueCents / 100 : c.valueCents + 'c'}`)
      .join(', ');
  }
}
