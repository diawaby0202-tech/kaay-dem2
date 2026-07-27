# Documentation de l'API — Kaay Dem !

**Base URL** : `http://127.0.0.1:8000/api/v1` (en développement local)
**Authentification** : Laravel Sanctum — token à envoyer dans l'en-tête `Authorization: Bearer {token}` pour toutes les routes marquées 🔒
**Format des réponses** : JSON. Les listes sont enveloppées dans `{ "data": [...] }`, les ressources uniques dans `{ "data": {...} }` (sauf `/login` et `/register` qui renvoient `{ "user": {...}, "token": "..." }`).

---

## 1. Authentification

| Méthode | Endpoint | Accès | Description | Corps de la requête |
|---|---|---|---|---|
| POST | `/register` | Public | Inscription d'un nouvel utilisateur | `name, email, password, password_confirmation, telephone?, campus?` |
| POST | `/login` | Public | Connexion, renvoie un token | `email, password` |
| POST | `/logout` | 🔒 | Déconnexion (invalide le token courant) | — |
| GET | `/me` | 🔒 | Profil de l'utilisateur connecté | — |
| PUT | `/me` | 🔒 | Modifier son profil | `name?, telephone?, campus?, photo?` (fichier) |
| GET | `/me/notifications` | 🔒 | Compteur pour la cloche (EF-06) : demandes en attente (conducteur) + avis à laisser (passager) | — |
| GET | `/me/transactions` | 🔒 | Historique du portefeuille virtuel (bonus : paiement simulé) | — |

## 2. Demande de statut conducteur (EF-02)

| Méthode | Endpoint | Accès | Description | Corps de la requête |
|---|---|---|---|---|
| POST | `/driver-requests` | 🔒 | Soumettre une demande de statut conducteur | `numero_permis, vehicule_marque, vehicule_modele, immatriculation` |

**Réponses d'erreur spécifiques** : `409` si une demande existe déjà pour cet utilisateur.

## 3. Trajets (EF-03, EF-04)

| Méthode | Endpoint | Accès | Description | Paramètres / Corps |
|---|---|---|---|---|
| GET | `/trips` | Public | Recherche paginée avec filtres | Query : `ville_depart?, ville_arrivee?, date?, prix_max?, places_min?, par_page?` |
| GET | `/trips/{id}` | Public | Détail d'un trajet | — |
| POST | `/trips` | 🔒 (conducteur validé) | Publier un trajet | `ville_depart, ville_arrivee, points_arret?, date_heure_depart, places_totales, prix_par_place` |
| PUT | `/trips/{id}` | 🔒 (auteur, si pas de résa confirmée) | Modifier un trajet | Mêmes champs que POST, tous optionnels |
| DELETE | `/trips/{id}` | 🔒 (auteur, si pas de résa confirmée) | Annuler un trajet (soft delete) | — |
| PATCH | `/trips/{id}/close` | 🔒 (auteur) | Clôturer le trajet (passe les résas confirmées à "terminée") | — |
| GET | `/me/trips` | 🔒 | Mes trajets publiés (avec réservations reçues) | — |

**Réponses d'erreur spécifiques** : `403` si non-conducteur validé tente de publier, ou si non-auteur tente de modifier/annuler ; `409` si tentative de modification/annulation après réservation confirmée.

## 4. Réservations (EF-05, EF-06)

| Méthode | Endpoint | Accès | Description | Corps |
|---|---|---|---|---|
| POST | `/trips/{id}/reservations` | 🔒 | Réserver des places sur un trajet | `nombre_places` |
| PATCH | `/reservations/{id}/accept` | 🔒 (conducteur du trajet) | Accepter une demande en attente | — |
| PATCH | `/reservations/{id}/refuse` | 🔒 (conducteur du trajet) | Refuser une demande en attente | — |
| PATCH | `/reservations/{id}/cancel` | 🔒 (passager concerné) | Annuler sa réservation | — |
| GET | `/me/reservations` | 🔒 | Mes réservations en tant que passager | — |
| POST | `/reservations/{id}/report` | 🔒 (passager ou conducteur de la réservation, si confirmée/terminée) | Signaler l'autre partie | `motif` |
| GET | `/reservations/{id}/messages` | 🔒 (participant, si confirmée/terminée) | Historique des messages de la réservation | — |
| POST | `/reservations/{id}/messages` | 🔒 (participant, si confirmée/terminée) | Envoyer un message | `contenu` |

**Cycle de vie** : `en_attente → confirmee → terminee` / `annulee` / `refusee` (voir section 5 du cahier des charges).
**Réponses d'erreur spécifiques** : `409` places insuffisantes, solde insuffisant (portefeuille virtuel, voir plus bas), chevauchement d'horaires, ou transition de statut invalide.

## Portefeuille virtuel (bonus : paiement simulé)

Chaque compte dispose d'un solde de démonstration (10 000 FCFA à l'inscription). Le montant total d'une réservation est débité du passager **dès la demande** (comme les places), et remboursé si elle est refusée ou annulée. Le conducteur, lui, est crédité **au moment où le trajet est clôturé** — pas à la simple confirmation — pour refléter le fait qu'un paiement réel n'est débloqué qu'une fois le service rendu. Chaque mouvement est tracé dans la table `transactions`, consultable via `/me/transactions`.

## 5. Évaluations (EF-07)

| Méthode | Endpoint | Accès | Description | Corps |
|---|---|---|---|---|
| POST | `/reservations/{id}/review` | 🔒 (passager, trajet terminé) | Laisser une note + commentaire | `note (1-5), commentaire?` |

**Réponses d'erreur spécifiques** : `403` si pas le passager ou trajet non terminé ; `409` si un avis existe déjà pour cette réservation.

## 6. Administration (EF-08, EF-09)

Toutes les routes ci-dessous nécessitent `is_admin = true` (sinon `403`).

| Méthode | Endpoint | Description | Corps |
|---|---|---|---|
| GET | `/admin/users` | Liste paginée des utilisateurs | — |
| PATCH | `/admin/users/{id}` | Activer/désactiver un compte | `is_active (bool)` |
| GET | `/admin/driver-requests` | Liste des demandes de statut conducteur | — |
| PATCH | `/admin/driver-requests/{id}` | Valider/rejeter une demande | `statut_validation (valide\|rejete)` |
| GET | `/admin/reports` | Liste des signalements | — |
| PATCH | `/admin/reports/{id}` | Marquer un signalement traité/rejeté | `statut_traitement (traite\|rejete)` |
| GET | `/admin/stats` | Statistiques (trajets/mois, taux d'occupation, top conducteurs) | — |
| GET | `/admin/trips/export` | Export CSV de tous les trajets (bonus) | — (réponse : fichier `.csv`) |

---

## Codes d'erreur HTTP utilisés

| Code | Signification | Exemple de cas |
|---|---|---|
| 401 | Non authentifié | Token manquant ou invalide sur une route protégée |
| 403 | Non autorisé | Tentative de modifier le trajet d'un autre conducteur |
| 404 | Introuvable | ID de trajet/réservation inexistant |
| 409 | Conflit métier | Places insuffisantes, avis déjà donné, demande conducteur en double |
| 422 | Validation échouée | Champ requis manquant, email déjà utilisé, format invalide |

## Comptes de démonstration (base seedée)

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@kaaydem.sn` | `password` |
| Utilisateurs générés | *(voir `php artisan tinker` → `User::all()`)* | `password` |

---

## Notifications par e-mail (bonus)

À la confirmation ou au refus d'une réservation par le conducteur, un e-mail est envoyé au passager via la file d'attente Laravel (`ShouldQueue`), sans bloquer la requête HTTP. En développement, `MAIL_MAILER=log` écrit l'e-mail dans `storage/logs/laravel.log` au lieu de l'envoyer réellement — pratique pour vérifier le contenu sans configurer de vrai serveur SMTP.

**Pour que les e-mails soient effectivement traités**, un worker doit tourner en parallèle du serveur :

```
php artisan queue:work
```

Sans ce worker, les jobs restent simplement en attente dans la table `jobs` (rien n'est perdu, ils seront traités dès que `queue:work` démarre).

## Utilisation de la collection Postman

1. Importez `Kaay_Dem_API.postman_collection.json` dans Postman
2. La variable `base_url` est déjà configurée sur `http://127.0.0.1:8000/api/v1`
3. Exécutez la requête **Authentification → Connexion** : le token est automatiquement sauvegardé dans la variable de collection `token` (via un script de test intégré) et réutilisé pour toutes les requêtes suivantes
4. Ajustez les variables `trip_id`, `reservation_id`, etc. selon les données réellement présentes dans votre base
