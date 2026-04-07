package com.afrishop.model;

public enum Category {
    ELECTRONIQUE("Electronique", "laptop"),
    MODE("Mode & Vetements", "shirt"),
    MAISON("Maison & Jardin", "home"),
    BEAUTE("Beaute & Sante", "heart"),
    SPORTS("Sports & Loisirs", "trophy"),
    AUTO("Auto & Moto", "car"),
    SERVICES("Services", "wrench"),
    ALIMENTATION("Alimentation", "apple");

    private final String displayName;
    private final String icon;

    Category(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getDisplayName() { return displayName; }
    public String getIcon() { return icon; }
}
