package com.afrishop.controller;

import com.afrishop.model.Seller;
import com.afrishop.service.ProductService;
import com.afrishop.service.SellerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
@RequestMapping("/sellers")
public class SellerController {

    private final SellerService sellerService;
    private final ProductService productService;

    public SellerController(SellerService sellerService, ProductService productService) {
        this.sellerService = sellerService;
        this.productService = productService;
    }

    @GetMapping
    public String sellers(
            @RequestParam(required = false, defaultValue = "rating") String sort,
            @RequestParam(required = false, defaultValue = "false") boolean premiumOnly,
            Model model) {
        model.addAttribute("sellers", sellerService.getFilteredSellers(sort, premiumOnly));
        model.addAttribute("selectedSort", sort);
        model.addAttribute("premiumOnly", premiumOnly);
        return "pages/sellers";
    }

    @GetMapping("/{id}")
    public String sellerProfile(@PathVariable Long id, Model model) {
        Optional<Seller> seller = sellerService.getSellerById(id);
        if (seller.isEmpty()) {
            return "redirect:/sellers";
        }
        model.addAttribute("seller", seller.get());
        model.addAttribute("sellerProducts", productService.getProductsBySeller(id));
        return "pages/seller-detail";
    }
}
