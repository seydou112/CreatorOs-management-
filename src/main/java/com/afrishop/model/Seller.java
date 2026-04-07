package com.afrishop.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sellers")
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String shopName;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 1000)
    private String description;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.NONE;

    private boolean verified;

    private double rating;

    private int totalSales;

    private LocalDate joinedAt;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) joinedAt = LocalDate.now();
    }

    public Seller() {}

    public Seller(String shopName, String slug, String description, String location, User user) {
        this.shopName = shopName;
        this.slug = slug;
        this.description = description;
        this.location = location;
        this.user = user;
    }

    public boolean isPremium() {
        return subscriptionPlan.isPremium();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public SubscriptionPlan getSubscriptionPlan() { return subscriptionPlan; }
    public void setSubscriptionPlan(SubscriptionPlan subscriptionPlan) { this.subscriptionPlan = subscriptionPlan; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public int getTotalSales() { return totalSales; }
    public void setTotalSales(int totalSales) { this.totalSales = totalSales; }
    public LocalDate getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDate joinedAt) { this.joinedAt = joinedAt; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
    public String getInitial() { return shopName != null && !shopName.isEmpty() ? String.valueOf(shopName.charAt(0)) : "?"; }
}
