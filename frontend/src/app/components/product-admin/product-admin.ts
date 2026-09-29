import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyCentsPipe } from '../../core/currency-cents.pipe';
import { MAX_QUANTITY, PRODUCT_TYPES, Product, ProductType } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-admin',
  imports: [FormsModule, CurrencyCentsPipe],
  templateUrl: './product-admin.html',
  styleUrl: './product-admin.css',
})
export class ProductAdmin {
  private productService = inject(ProductService);

  products = this.productService.products;
  productTypes = PRODUCT_TYPES;
  maxQuantity = MAX_QUANTITY;

  // fields for the "add product" form
  name = '';
  type: ProductType = 'SNACK';
  price: number | null = null;
  quantity = 0;
  addError = '';

  // id of the row currently being edited, null when nothing is being edited
  editId: number | null = null;
  editName = '';
  editType: ProductType = 'SNACK';
  editPrice: number | null = null;
  editQuantity = 0;
  editError = '';

  addProduct(): void {
    const priceCents = Math.round((this.price ?? 0) * 100);
    const result = this.productService.addProduct({
      name: this.name,
      type: this.type,
      priceCents,
      quantity: this.quantity,
    });

    if (!result.ok) {
      this.addError = result.error;
      return;
    }

    this.addError = '';
    this.name = '';
    this.type = 'SNACK';
    this.price = null;
    this.quantity = 0;
  }

  startEdit(product: Product): void {
    this.editId = product.id;
    this.editError = '';
    this.editName = product.name;
    this.editType = product.type;
    this.editPrice = product.priceCents / 100;
    this.editQuantity = product.quantity;
  }

  cancelEdit(): void {
    this.editId = null;
    this.editError = '';
  }

  saveEdit(id: number): void {
    const priceCents = Math.round((this.editPrice ?? 0) * 100);
    const result = this.productService.updateProduct(id, {
      name: this.editName,
      type: this.editType,
      priceCents,
      quantity: this.editQuantity,
    });

    if (!result.ok) {
      this.editError = result.error;
      return;
    }

    this.editId = null;
    this.editError = '';
  }

  deleteProduct(product: Product): void {
    if (confirm(`Delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id);
    }
  }
}
