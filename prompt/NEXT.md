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
- `AiddReferentialLevelCalculatorService` — orchestre les calculateurs d'axe, branché sur size + parallelism. `overallLevel` = `lowestLevel(sizeLevel, parallelismLevel)`
- Container IoC `@evyweb/ioctopus` dans `packages/app-nextjs/src/di/` — `ImprovementCollector` scoped, repository singleton. Chaque nouveau calculateur d'axe nécessite un token dans `di.ts` et un binding dans `container.ts`
- Route API `GET /api/evaluate/[profileId]` — retourne `DeveloperProfileResult` avec `improvements[]`
- 65 tests passent

## Prochain travail

Implémenter `InterventionLevelCalculatorService`, le brancher dans `AiddReferentialLevelCalculatorService` et l'inclure dans le calcul du `overallLevel`.

## Docs à lire avant d'implémenter

- `prompt/RULES.md` — règles de collaboration obligatoires
- `CLAUDE.md` — conventions du projet
- `doc/domain/schemas/` — entités domaine (00 à 10)
- `prompt/PARALLELISM.md` — décisions d'architecture de l'axe parallelism (pattern à reproduire)
