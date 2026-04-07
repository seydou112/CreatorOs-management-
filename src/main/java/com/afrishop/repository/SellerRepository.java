package com.afrishop.repository;

import com.afrishop.model.Seller;
import com.afrishop.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findBySlug(String slug);
    List<Seller> findBySubscriptionPlanIn(List<SubscriptionPlan> plans);
    List<Seller> findAllByOrderByRatingDesc();
}
