package com.dxc.vending.dto;

public record ProductDto(Long id, String name, String type, int priceCents, int quantity) {
}
