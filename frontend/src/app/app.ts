import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductAdmin } from './components/product-admin/product-admin';
import { VendingMachine } from './components/vending-machine/vending-machine';
import { ProductService } from './services/product.service';

type Tab = 'vending' | 'admin';

@Component({
  selector: 'app-root',
  imports: [VendingMachine, ProductAdmin],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly productService = inject(ProductService);

  readonly activeTab = signal<Tab>('vending');

  ngOnInit(): void {
    this.productService.loadInitialProducts();
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
