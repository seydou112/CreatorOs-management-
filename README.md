# AfriShop - Marketplace

Plateforme marketplace qui connecte vendeurs et acheteurs en Afrique.
Le site agit comme agent intermediaire et permet la mise en avant des vendeurs premium.

## Stack Technique

- **Backend** : Java 21 + Spring Boot 3.2
- **Frontend** : Thymeleaf + HTML/CSS/JS
- **Base de donnees** : H2 (dev) / MySQL ou PostgreSQL (production)
- **Build** : Maven

## Lancer le projet

```bash
mvn spring-boot:run
```

Puis ouvrir http://localhost:8080

## Pages

| Route | Description |
|---|---|
| `/` | Page d'accueil - Hero, categories, produits en vedette, vendeurs premium |
| `/products` | Catalogue avec filtres et tri |
| `/products/{id}` | Detail produit |
| `/sellers` | Liste des vendeurs |
| `/sellers/{id}` | Profil vendeur |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription (acheteur/vendeur) |
| `/pricing` | Plans d'abonnement (Gratuit, Starter, Pro, Business) |
| `/dashboard/seller` | Dashboard vendeur |
| `/dashboard/admin` | Dashboard admin |

## Plans d'abonnement

| Plan | Prix/mois | Commission | Avantages |
|---|---|---|---|
| Sans abonnement | Gratuit | 10% | Fonctionnalites de base |
| Starter | 9,900 FCFA | 5% | Badge, stats, 50 produits |
| Pro | 24,900 FCFA | 3% | Premium, mise en avant, produits illimites |
| Business | 49,900 FCFA | 1.5% | Page d'accueil, manager dedie, API |
