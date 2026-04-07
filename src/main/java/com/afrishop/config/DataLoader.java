package com.afrishop.config;

import com.afrishop.model.*;
import com.afrishop.repository.ProductRepository;
import com.afrishop.repository.SellerRepository;
import com.afrishop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;

    public DataLoader(UserRepository userRepository, SellerRepository sellerRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        // Users
        User u1 = userRepository.save(new User("Amadou Diallo", "amadou@techzone.sn", "password", UserRole.SELLER));
        User u2 = userRepository.save(new User("Fatou Camara", "fatou@fashionhouse.ci", "password", UserRole.SELLER));
        User u3 = userRepository.save(new User("Ibrahim Traore", "ibrahim@biomarket.ml", "password", UserRole.SELLER));
        User u4 = userRepository.save(new User("Mariama Bah", "mariama@autoparts.gn", "password", UserRole.SELLER));
        User u5 = userRepository.save(new User("Kofi Mensah", "kofi@deco.tg", "password", UserRole.SELLER));
        userRepository.save(new User("Admin", "admin@afrishop.com", "admin", UserRole.ADMIN));

        // Sellers
        Seller s1 = new Seller("TechZone Pro", "techzone-pro", "Specialiste en produits technologiques de haute qualite. Livraison rapide et service client premium.", "Dakar, Senegal", u1);
        s1.setSubscriptionPlan(SubscriptionPlan.BUSINESS);
        s1.setVerified(true);
        s1.setRating(4.8);
        s1.setTotalSales(1523);
        s1.setJoinedAt(LocalDate.of(2024, 1, 15));
        s1 = sellerRepository.save(s1);

        Seller s2 = new Seller("Fashion House", "fashion-house", "Les dernieres tendances mode a prix accessibles. Collections exclusives chaque semaine.", "Abidjan, Cote d'Ivoire", u2);
        s2.setSubscriptionPlan(SubscriptionPlan.PRO);
        s2.setVerified(true);
        s2.setRating(4.6);
        s2.setTotalSales(2341);
        s2.setJoinedAt(LocalDate.of(2023, 11, 20));
        s2 = sellerRepository.save(s2);

        Seller s3 = new Seller("Bio Market", "bio-market", "Produits bio et naturels directement des producteurs locaux.", "Bamako, Mali", u3);
        s3.setSubscriptionPlan(SubscriptionPlan.STARTER);
        s3.setVerified(true);
        s3.setRating(4.4);
        s3.setTotalSales(876);
        s3.setJoinedAt(LocalDate.of(2024, 3, 10));
        s3 = sellerRepository.save(s3);

        Seller s4 = new Seller("AutoParts Express", "autoparts-express", "Pieces auto et moto de qualite. Garantie et livraison express.", "Conakry, Guinee", u4);
        s4.setSubscriptionPlan(SubscriptionPlan.BUSINESS);
        s4.setVerified(true);
        s4.setRating(4.7);
        s4.setTotalSales(1102);
        s4.setJoinedAt(LocalDate.of(2024, 2, 1));
        s4 = sellerRepository.save(s4);

        Seller s5 = new Seller("Deco Interieur", "deco-interieur", "Transformez votre interieur avec nos collections uniques de decoration.", "Lome, Togo", u5);
        s5.setSubscriptionPlan(SubscriptionPlan.NONE);
        s5.setVerified(false);
        s5.setRating(4.3);
        s5.setTotalSales(654);
        s5.setJoinedAt(LocalDate.of(2024, 4, 5));
        s5 = sellerRepository.save(s5);

        // Products
        Product p;

        p = new Product("Smartphone Galaxy Ultra 2025", "Le dernier smartphone avec ecran AMOLED 6.8 pouces, camera 200MP et batterie 5000mAh.", 450000, "Electronique", s1);
        p.setFeatured(true); p.setRating(4.7); p.setReviewCount(89);
        productRepository.save(p);

        p = new Product("Laptop Pro 15 pouces", "Ordinateur portable haute performance. Processeur i7, 16GB RAM, SSD 512GB.", 385000, "Electronique", s1);
        p.setFeatured(true); p.setRating(4.8); p.setReviewCount(112);
        productRepository.save(p);

        p = new Product("Ecouteurs Bluetooth Premium", "Son haute fidelite, reduction de bruit active. Autonomie 30h.", 35000, "Electronique", s1);
        p.setFeatured(false); p.setRating(4.5); p.setReviewCount(67);
        productRepository.save(p);

        p = new Product("Robe Elegante Wax Africain", "Robe traditionnelle en tissu wax authentique. Coupe moderne et confortable.", 25000, "Mode & Vetements", s2);
        p.setFeatured(true); p.setRating(4.9); p.setReviewCount(156);
        productRepository.save(p);

        p = new Product("Ensemble Boubou Homme", "Boubou traditionnel en bazin riche. Broderie artisanale de qualite superieure.", 45000, "Mode & Vetements", s2);
        p.setFeatured(true); p.setRating(4.7); p.setReviewCount(98);
        productRepository.save(p);

        p = new Product("Sac a Main Cuir Artisanal", "Sac en cuir veritable fait main. Design africain contemporain.", 32000, "Mode & Vetements", s2);
        p.setFeatured(false); p.setRating(4.6); p.setReviewCount(54);
        productRepository.save(p);

        p = new Product("Huile d'Argan Bio 100ml", "Huile d'argan pure et bio, pressee a froid. Ideale pour les cheveux et la peau.", 8500, "Beaute & Sante", s3);
        p.setFeatured(true); p.setRating(4.5); p.setReviewCount(67);
        productRepository.save(p);

        p = new Product("Miel Pur des Montagnes", "Miel 100% naturel recolte dans les montagnes du Fouta Djallon.", 12000, "Alimentation", s3);
        p.setFeatured(true); p.setRating(4.8); p.setReviewCount(45);
        productRepository.save(p);

        p = new Product("Kit Freinage Complet Toyota", "Kit freinage complet compatible Toyota Corolla 2020-2025. Qualite OEM.", 75000, "Auto & Moto", s4);
        p.setFeatured(false); p.setRating(4.6); p.setReviewCount(34);
        productRepository.save(p);

        p = new Product("Filtre a Huile Universel", "Filtre haute performance compatible multi-marques.", 5500, "Auto & Moto", s4);
        p.setFeatured(false); p.setRating(4.4); p.setReviewCount(28);
        productRepository.save(p);

        p = new Product("Lampe Decorative Artisanale", "Lampe en bois sculpte a la main. Design africain contemporain.", 18000, "Maison & Jardin", s5);
        p.setFeatured(false); p.setRating(4.2); p.setReviewCount(23);
        productRepository.save(p);

        p = new Product("Coussin Tissu Kente", "Coussin decoratif en tissu kente authentique du Ghana.", 9000, "Maison & Jardin", s5);
        p.setFeatured(false); p.setRating(4.1); p.setReviewCount(15);
        productRepository.save(p);
    }
}
