package com.afrishop.controller;

import com.afrishop.model.Category;
import com.afrishop.model.Product;
import com.afrishop.service.ProductService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public String catalog(
            @RequestParam(required = false, defaultValue = "all") String category,
            @RequestParam(required = false, defaultValue = "recent") String sort,
            @RequestParam(required = false, defaultValue = "false") boolean premiumOnly,
            Model model) {
        model.addAttribute("products", productService.getFilteredProducts(category, sort, premiumOnly));
        model.addAttribute("categories", Category.values());
        model.addAttribute("selectedCategory", category);
        model.addAttribute("selectedSort", sort);
        model.addAttribute("premiumOnly", premiumOnly);
        return "pages/products";
    }

    @GetMapping("/{id}")
    public String productDetail(@PathVariable Long id, Model model) {
        Optional<Product> product = productService.getProductById(id);
        if (product.isEmpty()) {
            return "redirect:/products";
        }
        model.addAttribute("product", product.get());
        model.addAttribute("relatedProducts",
                productService.getProductsByCategory(product.get().getCategory())
                        .stream()
                        .filter(p -> !p.getId().equals(id))
                        .limit(4)
                        .toList());
        return "pages/product-detail";
    }
}
