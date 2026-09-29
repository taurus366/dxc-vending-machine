package com.dxc.vending.controller;

import com.dxc.vending.dto.ProductDto;
import com.dxc.vending.model.Product;
import com.dxc.vending.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Only a GET here - the Angular app loads this once and then handles
// adding/editing/deleting products itself, without calling the backend again.
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ProductDto> getInitialProducts() {
        return repository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private ProductDto toDto(Product product) {
        return new ProductDto(product.getId(), product.getName(), product.getType(),
                product.getPriceCents(), product.getQuantity());
    }
}
