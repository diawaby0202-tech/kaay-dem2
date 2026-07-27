# Guide de collaboration Git/GitHub — Kaay Dem !

Ce document explique comment respecter l'exigence 3.4 du cahier des charges
(« branches par fonctionnalité, pull requests relues par un pair, commits
conventionnels ») pour tout nouveau développement sur ce dépôt.

## 1. Une branche par fonctionnalité

Ne jamais commiter directement sur `main`. Pour chaque nouvelle
fonctionnalité ou correction :

```bash
git checkout main
git pull
git checkout -b feature/nom-court-de-la-fonctionnalite
```

Exemples de noms de branche utilisés sur ce projet :

- `feature/signalements`
- `feature/messagerie-interne`
- `feature/paiement-simule`
- `fix/date-francaise-emails`
- `docs/git-workflow-guide` (celle-ci)

## 2. Commits conventionnels

Chaque commit suit le format `type: description au présent` :

| Type | Usage |
|---|---|
| `feat:` | nouvelle fonctionnalité |
| `fix:` | correction de bug |
| `docs:` | documentation uniquement |
| `refactor:` | changement de code sans changement de comportement |
| `test:` | ajout/modification de tests |
| `chore:` | tâches annexes (dépendances, config) |

Exemple :

```bash
git add .
git commit -m "feat: ajoute le signalement d'un utilisateur après réservation"
```

## 3. Pousser la branche et ouvrir une Pull Request

```bash
git push -u origin feature/nom-court-de-la-fonctionnalite
```

Puis sur GitHub : **Pull requests → New pull request** → sélectionner la
branche → décrire ce qui a été fait → demander une relecture à un pair
(ou, en solo, se relire soi-même avant de fusionner — la CI doit être
verte avant tout merge).

## 4. Fusionner

Une fois la revue faite et la CI (`.github/workflows/ci.yml`) au vert,
fusionner via le bouton GitHub (« Squash and merge » ou « Merge pull
request »), puis supprimer la branche.

```bash
git checkout main
git pull
git branch -d feature/nom-court-de-la-fonctionnalite
```

## 5. Premier envoi de ce dépôt sur GitHub

Si ce dépôt n'est pas encore sur GitHub :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/kaay-dem.git
git branch -M main
git push -u origin main
git push -u origin docs/git-workflow-guide
```

Ouvrez ensuite la Pull Request de `docs/git-workflow-guide` vers `main`
sur GitHub pour voir le processus complet en conditions réelles.
