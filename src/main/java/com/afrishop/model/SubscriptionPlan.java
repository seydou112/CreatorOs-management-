package com.afrishop.model;

public enum SubscriptionPlan {
    NONE("Sans abonnement", 0, 10.0, "Frais de service sur chaque vente"),
    STARTER("Starter", 9900, 5.0, "Fonctionnalites de base"),
    PRO("Pro", 24900, 3.0, "Visibilite accrue et fonctionnalites avancees"),
    BUSINESS("Business", 49900, 1.5, "Mise en avant maximale et toutes les fonctionnalites");

    private final String displayName;
    private final int monthlyPriceFCFA;
    private final double commissionPercent;
    private final String description;

    SubscriptionPlan(String displayName, int monthlyPriceFCFA, double commissionPercent, String description) {
        this.displayName = displayName;
        this.monthlyPriceFCFA = monthlyPriceFCFA;
        this.commissionPercent = commissionPercent;
        this.description = description;
    }

    public String getDisplayName() { return displayName; }
    public int getMonthlyPriceFCFA() { return monthlyPriceFCFA; }
    public double getCommissionPercent() { return commissionPercent; }
    public String getDescription() { return description; }

    public boolean isPremium() {
        return this == PRO || this == BUSINESS;
    }
}
