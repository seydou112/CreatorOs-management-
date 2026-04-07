package com.afrishop.service;

import com.afrishop.model.Seller;
import com.afrishop.model.SubscriptionPlan;
import com.afrishop.repository.SellerRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SellerService {

    private final SellerRepository sellerRepository;

    public SellerService(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    public List<Seller> getAllSellers() {
        return sellerRepository.findAllByOrderByRatingDesc();
    }

    public List<Seller> getPremiumSellers() {
        return sellerRepository.findBySubscriptionPlanIn(
                List.of(SubscriptionPlan.PRO, SubscriptionPlan.BUSINESS)
        );
    }

    public Optional<Seller> getSellerById(Long id) {
        return sellerRepository.findById(id);
    }

    public Optional<Seller> getSellerBySlug(String slug) {
        return sellerRepository.findBySlug(slug);
    }

    public List<Seller> getFilteredSellers(String sort, boolean premiumOnly) {
        List<Seller> sellers = sellerRepository.findAll();

        if (premiumOnly) {
            sellers = sellers.stream().filter(Seller::isPremium).toList();
        }

        Comparator<Seller> comparator = switch (sort != null ? sort : "rating") {
            case "sales" -> Comparator.comparingInt(Seller::getTotalSales).reversed();
            case "name" -> Comparator.comparing(Seller::getShopName);
            default -> Comparator.comparingDouble(Seller::getRating).reversed();
        };

        return sellers.stream().sorted(comparator).toList();
    }

    public Seller save(Seller seller) {
        return sellerRepository.save(seller);
    }
}
