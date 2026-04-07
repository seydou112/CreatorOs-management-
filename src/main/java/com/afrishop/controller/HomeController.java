package com.afrishop.controller;

import com.afrishop.model.Category;
import com.afrishop.service.ProductService;
import com.afrishop.service.SellerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final ProductService productService;
    private final SellerService sellerService;

    public HomeController(ProductService productService, SellerService sellerService) {
        this.productService = productService;
        this.sellerService = sellerService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("featuredProducts", productService.getFeaturedProducts());
        model.addAttribute("premiumSellers", sellerService.getPremiumSellers());
        model.addAttribute("categories", Category.values());
        return "pages/home";
    }
}
