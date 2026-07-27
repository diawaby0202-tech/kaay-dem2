# Kaay Dem ! — Plateforme de covoiturage étudiant

Projet d'examen — ISEP Diamniadio — Développement web full-stack

« Kaay Dem ! » est une plateforme de covoiturage réservée à la communauté étudiante (Dakar, Rufisque, Diamniadio et campus environnants) : les conducteurs publient des trajets, les passagers réservent des places, et chacun évalue l'autre après le voyage.

## Structure du dépôt

```
kaaydem/
├── kaaydem-backend/     API REST Laravel
├── kaaydem-frontend/    SPA React (Vite)
└── docs/                Documentation API (Postman + tableau) et rapport technique
```

## Stack technique

| Composant | Technologie |
|---|---|
| Backend | Laravel 13, Sanctum (tokens), SQLite (dev) |
| Frontend | React 18, Vite, Tailwind CSS v4, React Router, Axios |
| Base de données | SQLite en développement — migrable vers MySQL/PostgreSQL |

## Installation

### Prérequis

- PHP 8.4+ et Composer (recommandé : [Laravel Herd](https://herd.laravel.com))
- Node.js 20+ et npm

### 1. Backend

```bash
cd kaaydem-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

L'API tourne sur **http://127.0.0.1:8000/api/v1**.

Dans un terminal séparé, pour traiter les e-mails en file d'attente (confirmation/refus de réservation) :

```bash
php artisan queue:work
```

Sans ce worker, les jobs restent simplement en attente dans la table `jobs` (rien n'est perdu). En développement, `MAIL_MAILER=log` écrit les e-mails dans `storage/logs/laravel.log` plutôt que de les envoyer réellement.

### 2. Frontend

Dans un second terminal :

```bash
cd kaaydem-frontend
npm install
npm run dev
```

L'application tourne sur **http://localhost:5173**.

⚠️ Les deux serveurs (backend et frontend) doivent tourner **en même temps**.

## Comptes de test (générés par le seeder)

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@kaaydem.sn` | `password` |
| Conducteurs / Passagers | voir `php artisan tinker` → `User::all()` | `password` |

Tous les comptes générés par les factories utilisent le mot de passe `password`.

## Fonctionnalités couvertes

- **EF-01, EF-02** — Authentification (Sanctum), profil modifiable (nom, téléphone, campus, photo), demande et validation du statut conducteur
- **EF-03, EF-04** — CRUD des trajets (publier/modifier/annuler/clôturer), recherche publique filtrée et paginée
- **EF-05, EF-06** — Cycle de vie complet des réservations, historique des transitions, cloche de notifications (demandes en attente / avis à laisser)
- **EF-07** — Évaluations avec note moyenne
- **EF-08, EF-09** — Tableaux de bord (conducteur, passager, admin), statistiques, gestion des utilisateurs, validation des conducteurs, traitement des signalements

### Exigences bonus réalisées

- Carte interactive du trajet (Leaflet + OpenStreetMap)
- Notifications par e-mail à la confirmation/au refus d'une réservation, via file d'attente Laravel (`ShouldQueue`)
- Export CSV des trajets (espace admin)
- Messagerie interne conducteur-passager (polling, rattachée à une réservation confirmée/terminée)
- Paiement simulé : portefeuille virtuel par utilisateur (10 000 FCFA de départ), débité à la demande de réservation, remboursé si refus/annulation, crédité au conducteur à la clôture du trajet

### Exigences bonus non réalisées

- Mode hors-ligne (PWA), déploiement en ligne

## Documentation

- **API** : voir `docs/Documentation_API.md` et la collection Postman `docs/Kaay_Dem_API.postman_collection.json`
- **Rapport technique** : `docs/Rapport_Technique_KaayDem.pdf` (diagrammes, choix d'architecture, captures d'écran)

## Tests

```bash
cd kaaydem-backend
php artisan test
```

## Licence

Projet académique — ISEP Diamniadio, 2026.
