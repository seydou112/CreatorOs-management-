package com.afrishop.repository;

import com.afrishop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFeaturedTrue();
    List<Product> findByCategory(String category);
    List<Product> findBySellerId(Long sellerId);
    List<Product> findAllByOrderByCreatedAtDesc();
}
