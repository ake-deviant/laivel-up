# Documentation technique — Laivel Up

Outil d'évaluation de la maîtrise AI-Driven Development (AIDD) des développeurs.
Il produit un level par développeur sur 6 axes, à partir de données observables — sans LLM dans la logique de scoring.

---

## Installation et démarrage

### Prérequis

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
npm install
```

### Lancer l'application

```bash
cd packages/app-nextjs
npm run dev
```

### Lancer les tests

```bash
# depuis la racine
npm test

# en mode watch (core uniquement)
npm run test:watch
```

---

## Structure du projet

```
laivel-up/
├── packages/
│   ├── core/              # Logique métier pure, framework-agnostic
│   └── app-nextjs/        # Interface Next.js 15, App Router
├── data/
│   └── profiles/          # Profils de développeurs (données d'entrée)
└── doc/
```

`packages/core` ne dépend d'aucun framework. Il exporte les entités, les services de calcul, les use cases et les mappeurs. `packages/app-nextjs` consomme `@laivel-up/core` et expose l'API REST et l'interface utilisateur.

---

## Ajouter un profil développeur

Créer un dossier dans `data/profiles/profiles/<profileId>/`.

La procédure reproductible complète, incluant `PROFILES_BASE_DIR`, `.env.local`, un profile fictif à copier et les étapes de vérification, est disponible dans [`doc/profiles.md`](doc/profiles.md).

### Fichiers requis

| Fichier | Contenu |
| :--- | :--- |
| `profile.json` | Identité, stack, rôle, expérience, sources disponibles |
| `git-activity.json` | Distribution des PR, commits, parallélisme, CI, harness |

### Fichiers optionnels (enrichissent le scoring)

| Fichier / Dossier | Axe concerné |
| :--- | :--- |
| `sprint-metrics.json` | velocity |
| `delivery-confidence.json` | deliveryConfidence |
| `sonar-measures.json` | qualité de code (signal) |
| `pull-requests.json` | intervention |
| `repo-context/` | harness — détection du contexte IA en place |

### Structure minimale de `profile.json`

```json
{
  "profile_id": "john-doe",
  "available": ["git-activity"],
  "role": "fullstack",
  "experience_years": 5,
  "stack": ["TypeScript", "React"],
  "team_size": 4
}
```

Le champ `available` déclare les sources présentes. Le parser l'utilise pour savoir quelles données charger. Les sources absentes n'affectent pas les axes qu'elles n'alimentent pas.

---

## Modèle d'évaluation

### Les 7 levels (ordre croissant)

`white` → `red` → `blue` → `green` → `copper` → `silver` → `gold`

### Les 6 axes

| Axe | Ce qui est mesuré |
| :--- | :--- |
| `size` | Distribution des tailles de PR (XS → XL) |
| `harness` | Outillage IA en place (CLAUDE.md, hooks, CI, agents…) |
| `intervention` | Autonomie des PR (corrections, éditions humaines, review comments) |
| `parallelism` | Branches concurrentes (médiane et maximum) |
| `velocity` | Ratio levier IA sur la vélocité sprint |
| `deliveryConfidence` | Fiabilité de livraison, impact business, autonomie |

### Règle de niveau global

```
level global = plus bas des levels d'axe (bloquants)
```

Un seul axe en retard bloque le level global. `velocity` et `deliveryConfidence` sont non-bloquants par défaut — ils influencent les signaux mais pas le level final.

---

## Configuration de l'évaluation

La configuration est ajustable depuis la page **Config** de l'interface. Elle est persistée dans le `localStorage` et transmise à chaque appel d'évaluation. Un bouton **Rétablir la configuration initiale** restaure les valeurs par défaut.

### Algorithmes par axe

Trois axes proposent plusieurs algorithmes. Le choix modifie la formule de scoring **et** les signaux associés — les deux restent toujours cohérents.

#### Axe `size`

| Identifiant | Logique |
| :--- | :--- |
| `dominant-distribution` *(défaut)* | Le level dépend de la catégorie dominante, puis de la part des PR L et XL |
| `weighted-average` | Toutes les tailles contribuent à un score moyen : `XS×0 + S×1 + M×2 + L×3 + XL×4` |

#### Axe `harness`

| Identifiant | Logique |
| :--- | :--- |
| `weighted-score` *(défaut)* | Les fichiers et capacités accumulent des points jusqu'aux seuils de chaque level |
| `capability-gates` | Chaque level exige une chaîne complète. Un signal absent ne peut pas être compensé par un autre |

#### Axe `parallelism`

| Identifiant | Logique |
| :--- | :--- |
| `weighted` *(défaut)* | `score = médiane × poids_médiane + maximum × poids_max` |
| `median-only` | `score = médiane × poids_médiane` — les pics isolés n'influencent pas le level |

---

### Poids et seuils configurables

Les valeurs numériques sont ajustables depuis la même page Config.

#### Parallelism — poids

| Paramètre | Défaut | Rôle |
| :--- | :--- | :--- |
| `median` | `5` | Poids de la médiane de branches concurrentes |
| `max` | `1` | Poids du maximum (ignoré avec `median-only`) |

#### Parallelism — seuils de level

Score minimum requis par level :

| Level | Seuil par défaut |
| :--- | :--- |
| red | 7 |
| blue | 10 |
| green | 15 |
| copper | 20 |
| silver | 25 |
| gold | 30 |

Le gold exige en plus `hasWorktreeInclude = true` (présence d'un `.worktreeinclude`). Ce critère est un gate non compensable, indépendant du score.

#### Harness — poids Context Engineering

| Signal | Défaut |
| :--- | :--- |
| `claudeMd` | 4 |
| `memoryCount` | 4 |
| `docsSpecsCount` | 3 |
| `docsPlansCount` | 3 |
| `tasksCount` | 3 |
| `docsBrainstormCount` | 2 |
| `docsContextCount` | 2 |

#### Harness — poids AI Configuration

| Signal | Défaut |
| :--- | :--- |
| `hooksCount` | 4 |
| `rulesCount` | 4 |
| `agentsMd` | 3 |
| `agentsCount` | 3 |
| `skillsCount` | 3 |
| `settingsJson` | 2 |

#### Size — seuils Weighted Average

Score moyen minimum requis par level (algorithme `weighted-average`) :

| Level | Seuil par défaut |
| :--- | :--- |
| red | 0.5 |
| blue | 1.25 |
| green | 2.0 |
| copper | 2.5 |
| silver | 3.0 |
| gold | 3.5 |

#### Axes non-bloquants

Par défaut : `velocity` et `deliveryConfidence`.

Un axe non-bloquant est évalué et affiché, mais son level n'entre pas dans le calcul du level global. Cette liste est configurable.

---

## Flux d'évaluation

```
POST /api/evaluate/:profileId  ←  EvaluationConfig (optionnel)
         ↓
  Chargement des fichiers du profil
         ↓
  Parsing Zod (strict → permissif avec avertissements)
         ↓
  Triage : identification des données manquantes
         ↓
  Calcul du level par axe (6 calculateurs)
         ↓
  Level global = min(axes bloquants)
         ↓
  Détection des signaux par axe
         ↓
  Dérivation des opportunités d'amélioration
         ↓
  Présentation → DeveloperProfileResultViewModel
```

Le parsing tente d'abord le schéma strict. En cas d'échec partiel, il repasse en mode permissif : les champs mal formés sont capturés comme `FormatWarning` sans bloquer l'évaluation. Seuls les champs essentiels (`profile_id`, `available`) sont bloquants.

---

## Routes de l'API

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profiles` | Liste tous les profils disponibles |
| `POST` | `/api/evaluate/:profileId` | Évalue un profil avec la config fournie en body |

Le body du `POST` est optionnel. Sans config, les valeurs par défaut s'appliquent.

---

## Pages de l'interface

| URL | Description |
| :--- | :--- |
| `/` | Vue d'ensemble des profils évalués |
| `/profiles` | Tableau de tous les développeurs |
| `/:profileId/:axis` | Détail d'un axe pour un développeur |
| `/config` | Réglage des algorithmes, poids et seuils |

---

→ [README](README.md) · [Méthodologie](methodologie.md)
