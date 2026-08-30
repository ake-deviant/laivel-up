# Axe Velocity — Décisions d'implémentation

## Métier

Mesure la **cadence de livraison** d'un développeur relativement à son équipe : est-il en dessous, dans la norme, ou au-dessus ? Les valeurs brutes (points, jours) n'ont de sens qu'en rapport à la moyenne de l'équipe.

## Données utilisées

Source : `sprint-metrics.json` à la racine du dossier profil.

| Champ | Type | Rôle |
|---|---|---|
| `sprintCount` | `number \| null` | **Essentiel** — nombre de sprints observés |
| `storyPointsPerSprint` | `number \| null` | **Essentiel** — débit moyen du développeur |
| `teamAvgStoryPointsPerSprint` | `number \| null` | **Essentiel** — référence équipe pour le débit |
| `completionRate` | `number \| null` | **Impactant** — taux de complétion des sprints |
| `medianDaysTicketToPr` | `number \| null` | **Impactant** — cycle time médian du développeur |
| `teamAvgMedianDaysTicketToPr` | `number \| null` | **Impactant** — référence équipe pour le cycle time |
| `featuresPerSprint` | `number \| null` | **Optionnel** — pour le ratio features/bugs |
| `bugsPerSprint` | `number \| null` | **Optionnel** — pour le ratio features/bugs |

**Essentiel** : si l'un des trois champs essentiels est `null`, velocity n'est pas calculable. L'axe est exclu du calcul du `overallLevel` (il ne tire pas le profil vers le bas).

## Métriques dérivées

Le calculateur ne travaille pas sur les valeurs brutes mais sur trois ratios :

| Métrique | Formule | Rôle |
|---|---|---|
| `leverageRatio` | `storyPointsPerSprint / teamAvgStoryPointsPerSprint` | Signal principal — essentiel-dérivé : `null` bloque |
| `cycleTimeRatio` | `teamAvgMedianDaysTicketToPr / medianDaysTicketToPr` | Productivité relative (ratio > 1 = plus rapide que l'équipe) — impactant : `null` passe |
| `featureRatio` | `featuresPerSprint / (featuresPerSprint + bugsPerSprint)` | Part du travail orienté valeur — optionnel : `null` passe |

## Seuils par défaut

| Level | `leverageRatio` ≥ | `completionRate` ≥ | `cycleTimeRatio` ≥ | `featureRatio` ≥ |
|---|---|---|---|---|
| gold | 2.0 | 0.90 | 2.0 | 0.70 |
| silver | 1.8 | 0.85 | 1.5 | — |
| copper | 1.5 | 0.80 | — | — |
| green | 1.2 | 0.70 | — | — |
| blue | 1.0 | — | — | — |

Les conditions sur `completionRate`, `cycleTimeRatio` et `featureRatio` sont **impactantes** : si la valeur est `null`, la condition est ignorée (ne bloque pas le level). En revanche si la valeur est présente et inférieure au seuil, elle fait échouer le level.

Évaluation du plus haut level au plus bas : le premier level dont toutes les conditions passent est retenu. Si aucun ne passe (leverageRatio < 1.0) : `red`.

## Vérification sur les profils de test

| Profil | leverageRatio | completionRate | cycleTimeRatio | featureRatio | Level attendu |
|---|---|---|---|---|---|
| galahad | 2.40 | 0.95 | 2.67 | 0.80 | gold |
| arthur | 1.83 | 0.87 | 1.67 | 0.67 | silver |
| leodagan | 1.80 | 0.88 | 1.60 | 0.78 | silver |
| blanchefleur | 1.52 | 0.82 | 1.13 | 0.67 | copper |
| bohort | 1.33 | 0.75 | 1.10 | 0.60 | green |
| perceval | 1.04 | 0.72 | 0.92 | 0.50 | blue |
| gauvain | — | — | — | — | non calculable (exclu) |
| paul | — | — | — | — | non calculable (exclu) |

## Ce qui est implémenté

- `VelocityProfile` — entité domaine (`domain/entities/velocity-profile.ts`)
- `VelocityReadinessChecker` — implémente `IAxisReadinessChecker<VelocityProfile>` ; détermine si l'axe est calculable
- `createVelocityLevelCalculator` / `VelocityThresholdsConfig` — calculateur avec config injectable
- Input schema Zod `laivelUpSprintMetricsInputSchema` + parser câblé dans `ZodProfileParser`
- Mapper `mapVelocity()` dans `developer-profile-mapper.ts`
- Intégration dans `AiddReferentialLevelCalculatorService` : velocity exclu du `lowestLevel` si non calculable
- Intégration dans `ImprovementOpportunityService` : le `overallLevel` courant et résultant tient compte de velocity quand calculable
- Presenter : groupe de champs velocity dans `toVelocityFieldGroups()` (3 groupes : throughput, cycleTime, scope) ; champ `calculable` sur `AxisViewModel`
- DI container : `VELOCITY_LEVEL_CALCULATOR` + `VelocityReadinessChecker` instanciés

## Ce qui reste à faire

### 1. VelocitySignalDetector

**Fichier à créer** : `domain/services/velocity-signal-detector.ts`

Implémente `IAxisSignalDetector<VelocityProfile>`. Même pattern que `size-signal-detector.ts`, `intervention-signal-detector.ts`, etc.

Pour chaque level, les signaux à valider pour atteindre le level suivant :

| Level suivant | Signaux |
|---|---|
| blue | `leverageRatio ≥ 1.0` |
| green | `leverageRatio ≥ 1.2`, `completionRate ≥ 0.70` |
| copper | `leverageRatio ≥ 1.5`, `completionRate ≥ 0.80` |
| silver | `leverageRatio ≥ 1.8`, `completionRate ≥ 0.85`, `cycleTimeRatio ≥ 1.5` |
| gold | `leverageRatio ≥ 2.0`, `completionRate ≥ 0.90`, `cycleTimeRatio ≥ 2.0`, `featureRatio ≥ 0.70` |

Les signaux dont la valeur dérivée est `null` (champs source manquants) sont marqués non validés avec `value: null`.

**À câbler dans le use case** : ajouter `velocityDetector: IAxisSignalDetector<VelocityProfile>` au constructeur de `EvaluateDeveloperProfileUseCase` et l'inclure dans `signalMatrices` (conditionnel : seulement si `velocityReadiness.calculable`).

**À câbler dans le DI container** : `DI.VELOCITY_SIGNAL_DETECTOR` → `createVelocitySignalDetector(defaultVelocityThresholdsConfig)`.

**Tests à écrire** : `velocity-signal-detector.spec.ts` (même structure que les autres détecteurs) + mettre à jour `evaluate-developer-profile.use-case.spec.ts`.

### 2. VelocityImprovementOpportunityDetector

**Fichier à créer** : `domain/services/velocity-improvement-opportunity-detector.ts`

Implémente `IAxisImprovementOpportunityDetector<VelocityProfile>`. Même pattern que `size-improvement-opportunity-detector.ts`.

Candidats à simuler (un seul champ modifié à la fois) :

| Champ simulé | Description |
|---|---|
| `storyPointsPerSprint` | Passer au seuil du level suivant (leverageRatio cible) |
| `completionRate` | Passer au seuil du level suivant |
| `medianDaysTicketToPr` | Passer au seuil du level suivant (cycleTimeRatio cible) |
| `featuresPerSprint` | Passer au seuil featureRatio gold (si bugsPerSprint présent) |

Chaque simulation recalcule le level via `VelocityLevelCalculatorService` et retourne un `PartialOpportunity` si `levelGain > 0`.

**À câbler dans `ImprovementOpportunityService`** : ajouter `velocityDetector: VelocityImprovementOpportunityDetector` au constructeur et appeler `this.velocityDetector.detect(profile.velocity)` dans la liste des `candidates` (uniquement si velocity est calculable).

**À câbler dans le DI container** : instancier `VelocityImprovementOpportunityDetector` dans la factory de `IMPROVEMENT_OPPORTUNITY_SERVICE`.

**Tests à écrire** : `velocity-improvement-opportunity-detector.spec.ts` + mettre à jour `improvement-opportunity.service.spec.ts`.
