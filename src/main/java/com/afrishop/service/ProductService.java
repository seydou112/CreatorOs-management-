package com.afrishop.service;

import com.afrishop.model.Product;
import com.afrishop.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getFilteredProducts(String category, String sort, boolean premiumOnly) {
        List<Product> products;
        if (category != null && !category.isEmpty() && !category.equals("all")) {
            products = productRepository.findByCategory(category);
        } else {
            products = productRepository.findAll();
        }

        if (premiumOnly) {
            products = products.stream().filter(Product::isPremium).toList();
        }

        Comparator<Product> comparator = switch (sort != null ? sort : "recent") {
            case "price-asc" -> Comparator.comparingInt(Product::getPrice);
            case "price-desc" -> Comparator.comparingInt(Product::getPrice).reversed();
            case "rating" -> Comparator.comparingDouble(Product::getRating).reversed();
            default -> Comparator.comparing(Product::getCreatedAt).reversed();
        };

        return products.stream().sorted(comparator).toList();
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }
}
