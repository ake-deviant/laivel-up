# Contexte — Où on en est

Hackathon Laivel Up (deadline 31 août 12h). L'objectif est d'évaluer le niveau AIDD d'un développeur selon un référentiel à 7 niveaux et 4 axes.

La couche infra est terminée et testée. La prochaine étape est le calculateur de niveau AIDD.

---

## Ce qui est fait

- Entités domaine dans `domain/entities/` : `DeveloperProfile`, `DeveloperProfileResult`, `AiddLevelValue`, `DataSource`, `Profile`, `SizeProfile`, `SizeDistribution`, `HarnessProfile`, `ContextEngineeringProfile`, `BehaviorProfile`, `LoopsProfile`, `InterventionProfile`, `ParallelismProfile`
- Types input LaivelUp dans `infrastructure/inputs/` : `LaivelUpProfileInput`, `LaivelUpGitActivityInput`, `LaivelUpPullRequestInput`, `LaivelUpSonarMeasuresInput`, `LaivelUpAiContextInput`
- `ZodProfileParser` — double passe : strict sur `profile_id`/`available`, permissif avec `.catch(null)` sur le reste. Retourne `ParseError` avec `blockingFields: string[]`
- `DeveloperProfileMapper` — mappe `LaivelUpProfileInput` → `DeveloperProfile` (interne au repository)
- `LaivelUpDeveloperProfileRepository` — lit un répertoire, parse et mappe en interne, retourne `Result<DeveloperProfile, ParseError>`. `unknown` ne sort pas de l'infra.
- `IDeveloperProfileRepository` dans `application/ports/developer-profile-repository.port.ts`
- Tests : parser (unitaires + scénarios invalides) + repository (intégration du flux complet) — 37 tests passent
- Décision test : le repo test le flux complet en intégration (repo → parser → mapper). Les tests unitaires du parser couvrent les cas limites (blockingFields, scénarios invalides). Le mapper est testé uniquement en intégration.

## Ce qui reste à faire

1. Implémenter `AiddReferentialLevelCalculatorService` (implémente `IDeveloperProfileEvaluator`)
2. Brancher le tout dans le use case `EvaluateDeveloperProfileUseCase`
3. Mettre à jour `DeveloperProfileFixture`, `DeveloperProfileTriageService`, `index.ts`

## Docs à lire avant d'implémenter

- `prompt/RULES.md` — règles de collaboration obligatoires
- `CLAUDE.md` — conventions du projet
- `doc/domain/schemas/` — entités domaine (00 à 10)
- `doc/domain/ports/` — contrat du calculateur de niveau
- `doc/infra/schemas/` — format des données d'entrée LaivelUp
- `Sujets/aidd.md` — référentiel AIDD officiel (7 niveaux, grille des 4 axes)
