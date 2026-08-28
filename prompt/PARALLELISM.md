# Axe Parallelism — Décisions d'implémentation

## Métier

Mesure combien de chantiers un développeur fait avancer en parallèle, **habituellement**. Un pic isolé ne compte pas.

## Données utilisées

| Champ | Type | Rôle |
|---|---|---|
| `medianConcurrentBranches` | `number \| null` | Signal principal — l'habitude réelle |
| `maxConcurrentBranches` | `number \| null` | Signal secondaire — la capacité maximale |
| `hasWorktreeInclude` | `boolean \| null` | Condition qualitative — outillage des worktrees Git |

## Architecture

Quatre niveaux de découplage, du plus haut au plus bas :

```
IParallelismLevelCalculator                   ← swap complet de l'algo
  └── WeightedParallelismLevelCalculatorService
        ├── IParallelismScoringStrategy        ← swap de la logique de score
        │     └── WeightedParallelismScoringStrategy (poids configurables)
        └── IParallelismLevelThreshold[]       ← seuils par level (du plus haut au plus bas)
              └── matches(score, profile)      ← accès au profil pour les conditions booléennes
```

## Logique de calcul par défaut

### Score

```
score = (medianConcurrentBranches ?? 0) × weightMedian
      + (maxConcurrentBranches ?? 0)    × weightMax
```

Le worktree **n'entre pas dans le score** — c'est une condition, pas une pondération.

### Poids par défaut

| Champ | Poids |
|---|---|
| `medianConcurrentBranches` | 5 |
| `maxConcurrentBranches` | 1 |

### Seuils par défaut

| Level | minScore | Condition supplémentaire |
|---|---|---|
| gold | 20 | `hasWorktreeInclude === true` |
| silver | 25 | — |
| copper | 20 | — |
| green | 15 | — |
| blue | 10 | — |
| red | 7 | — |
| white | fallback | — |

Les levels sont évalués du plus haut au plus bas. Le premier `matches` gagne.

### Vérification sur les 4 profils de test

| Profil | median | max | worktree | Score | Level attendu |
|---|---|---|---|---|---|
| Arthur | 4 | 7 | ✓ | 27 | gold |
| Bohort | 1 | 3 | ✗ | 8 | red |
| Leodagan | 1 | 2 | ✗ | 7 | red |
| Perceval | 1 | 2 | ✗ | 7 | red |

## Justifications

- **median >> max (poids 5 vs 1)** : la doc dit explicitement "un pic isolé ne compte pas" — l'habitude prime.
- **worktree = condition pour gold, pas pondération** : c'est un signal qualitatif d'outillage, pas une mesure de quantité. Le sortir du score permet de changer son rôle sans toucher à la stratégie de pondération.
- **IParallelismLevelThreshold.matches(score, profile)** : le level gold ayant besoin d'accéder à `hasWorktreeInclude` directement, la signature expose le profil complet — les autres levels l'ignorent.
- **Niveaux supérieurs toujours plus difficiles** : garanti structurellement par des `minScore` croissants du bas vers le haut, évalués dans l'ordre inverse.
