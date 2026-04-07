package com.afrishop.controller;

import com.afrishop.service.ProductService;
import com.afrishop.service.SellerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    private final ProductService productService;
    private final SellerService sellerService;

    public DashboardController(ProductService productService, SellerService sellerService) {
        this.productService = productService;
        this.sellerService = sellerService;
    }

    @GetMapping("/seller")
    public String sellerDashboard(Model model) {
        model.addAttribute("totalProducts", productService.getAllProducts().size());
        return "pages/dashboard-seller";
    }

    @GetMapping("/admin")
    public String adminDashboard(Model model) {
        model.addAttribute("sellers", sellerService.getAllSellers());
        model.addAttribute("products", productService.getAllProducts());
        model.addAttribute("premiumSellers", sellerService.getPremiumSellers());
        return "pages/dashboard-admin";
    }
}
