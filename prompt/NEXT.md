# Contexte — Où on en est

Hackathon Laivel Up (deadline 31 août 12h). L'objectif est d'évaluer le niveau AIDD d'un développeur selon un référentiel à 7 niveaux et 4 axes.

---

## Ce qui est fait

- Entités domaine dans `domain/entities/` : `DeveloperProfile`, `DeveloperProfileResult`, `AiddLevelValue`, `DataSource`, `Profile`, `SizeProfile`, `SizeDistribution`, `HarnessProfile`, `ContextEngineeringProfile`, `BehaviorProfile`, `LoopsProfile`, `InterventionProfile`, `ParallelismProfile`, `Improvement`, `ImprovementAxis`
- Types input LaivelUp dans `infrastructure/inputs/` : `LaivelUpProfileInput`, `LaivelUpGitActivityInput`, `LaivelUpPullRequestInput`, `LaivelUpSonarMeasuresInput`, `LaivelUpAiContextInput`
- `ZodProfileParser` — double passe, retourne `ParseError` avec `blockingFields: string[]`
- `DeveloperProfileMapper` — mappe `LaivelUpProfileInput` → `DeveloperProfile` (interne au repository)
- `LaivelUpDeveloperProfileRepository` — reçoit `baseDir` en construction, résout `baseDir/profileId`, parse et mappe en interne, retourne `Result<DeveloperProfile, ParseError>`
- `IDeveloperProfileRepository` — port : `findById(profileId): Result<DeveloperProfile, ParseError>`
- `EvaluateDeveloperProfileUseCase` — reçoit `profileId: string`, appelle le repository, triage, évalue, collecte les improvements
- `DeveloperProfileTriageService` — vérifie les issues bloquantes sur `DeveloperProfile`
- `DeveloperProfileFixture` — shape réel, `valid()` et `withoutId()`
- `SizeLevelCalculatorService` / `ISizeLevelCalculator` — thresholds configurables pour les 7 niveaux via `SizeThresholdsConfig`
- `defaultSizeThresholdsConfig` — config prod
- `ILevelImprovementBus` / `LevelImprovementEvent` — port domaine, sync, transverse à tous les axes
- `ImprovementCollector` — implémente `ILevelImprovementBus`, accumule les events, exposé en scoped dans le container
- `createWeightedParallelismLevelCalculator` — score pondéré `median × 5 + max × 1`, worktree = condition gold, events `worktree_data_missing` / `worktree_not_configured`
- `defaultParallelismThresholdsConfig` — config prod (séparée de la fixture de test)
- `lowestLevel(...levels)` — fonction dans `aidd-level-value.ts`, retourne le niveau le plus bas parmi une liste de niveaux
- `AiddReferentialLevelCalculatorService` — orchestre les calculateurs d'axe, branché sur size + intervention + parallelism. `overallLevel` = `lowestLevel(sizeLevel, interventionLevel, parallelismLevel)`
- `createInterventionLevelCalculator` — conditions multi-signaux configurables par level via `InterventionThresholdsConfig`. Signaux : `medianCorrectionCommitsAfterOpen`, `humanCommitRatio`, `mergedWithoutHumanEditRatio`, `medianReviewCommentsReceived`
- `defaultInterventionThresholdsConfig` — config prod (séparée de la fixture de test)
- `InterventionProfile` — enrichi : `totalPrCount`, `mergedWithoutHumanEditCount`, `mergedWithoutHumanEditRatio` (calculé dans le mapper depuis count / total)
- Container IoC `@evyweb/ioctopus` dans `packages/app-nextjs/src/di/` — `ImprovementCollector` scoped, repository singleton. Chaque nouveau calculateur d'axe nécessite un token dans `di.ts` et un binding dans `container.ts`
- Route API `GET /api/evaluate/[profileId]` — retourne `DeveloperProfileResult` avec `improvements[]`
- 79 tests passent

## Décisions d'algorithme — axe Intervention

- `medianCorrectionCommitsAfterOpen` est le signal principal (commits poussés après ouverture de la PR)
- `humanCommitRatio` distingue silver de copper et gold de silver
- `mergedWithoutHumanEditRatio` confirme silver (≥ 0.50)
- `medianReviewCommentsReceived` renforce copper et blue
- Green est sauté : quand les deux descriptions sont identiques, on attribue le level le plus haut (copper)
- Gold requiert les 3 conditions strictes à 0/0/1 — "plusieurs PR par jour" retiré (donnée non mesurable fiablement, à documenter dans README)
- 79 tests passent

## Prochain travail

À définir par l'utilisateur.

## Docs à lire avant d'implémenter

- `prompt/RULES.md` — règles de collaboration obligatoires
- `CLAUDE.md` — conventions du projet
- `doc/domain/schemas/` — entités domaine (00 à 10)
- `prompt/PARALLELISM.md` — décisions d'architecture de l'axe parallelism (pattern à reproduire)
