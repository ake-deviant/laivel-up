# Contexte — Où on en est

Hackathon Laivel Up (deadline 31 août 12h). L'objectif est d'évaluer le niveau AIDD d'un développeur selon un référentiel à 7 niveaux et 4 axes.

La couche infra et le use case sont câblés. La prochaine étape est le calculateur de niveau AIDD.

---

## Ce qui est fait

- Entités domaine dans `domain/entities/` : `DeveloperProfile`, `DeveloperProfileResult`, `AiddLevelValue`, `DataSource`, `Profile`, `SizeProfile`, `SizeDistribution`, `HarnessProfile`, `ContextEngineeringProfile`, `BehaviorProfile`, `LoopsProfile`, `InterventionProfile`, `ParallelismProfile`
- Types input LaivelUp dans `infrastructure/inputs/` : `LaivelUpProfileInput`, `LaivelUpGitActivityInput`, `LaivelUpPullRequestInput`, `LaivelUpSonarMeasuresInput`, `LaivelUpAiContextInput`
- `ZodProfileParser` — double passe, retourne `ParseError` avec `blockingFields: string[]`
- `DeveloperProfileMapper` — mappe `LaivelUpProfileInput` → `DeveloperProfile` (interne au repository)
- `LaivelUpDeveloperProfileRepository` — reçoit `baseDir` en construction, résout `baseDir/profileId`, parse et mappe en interne, retourne `Result<DeveloperProfile, ParseError>`
- `IDeveloperProfileRepository` — port : `findById(profileId): Result<DeveloperProfile, ParseError>`
- `EvaluateDeveloperProfileUseCase` — reçoit `profileId: string`, appelle le repository, triage, évalue
- `DeveloperProfileTriageService` — vérifie les issues bloquantes sur `DeveloperProfile`
- `DeveloperProfileFixture` — shape réel, `valid()` et `withoutId()`
- `.env` à la racine — `PROFILES_BASE_DIR=/data/profiles` (prod)
- `.env.test` à la racine — `PROFILES_BASE_DIR=src/tests/fixtures/profiles` (tests)
- `data/profiles/` — répertoire de données prod, ignoré par git
- 38 tests passent

## Ce qui reste à faire

1. Implémenter `AiddReferentialLevelCalculatorService` (implémente `IDeveloperProfileEvaluator`)
2. Brancher le calculateur dans le use case
3. Mettre à jour `index.ts` exports

## Docs à lire avant d'implémenter

- `prompt/RULES.md` — règles de collaboration obligatoires
- `CLAUDE.md` — conventions du projet
- `doc/domain/schemas/` — entités domaine (00 à 10)
- `doc/domain/ports/` — contrat du calculateur de niveau
- `Sujets/aidd.md` — référentiel AIDD officiel (7 niveaux, grille des 4 axes)
