package com.afrishop.controller;

import com.afrishop.model.SubscriptionPlan;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PricingController {

    @GetMapping("/pricing")
    public String pricing(Model model) {
        model.addAttribute("plans", SubscriptionPlan.values());
        return "pages/pricing";
    }
}
