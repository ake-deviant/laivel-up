# 2026-08-28 — Préparation des schémas

## Ce qui a été fait

- Analyse des 4 profils LaivelUp (arthur, bohort, leodagan, perceval)
- Documentation des schémas d'entrée infra (`doc/infra/schemas/`) : profile, git-activity, pull-requests, sonar, declaratif, session, repo-context, code
- Analyse de chaque champ : type, impact score, méthode (algo / LLM)
- Mapping de tous les champs utiles vers les 4 axes du référentiel AIDD
- Documentation des schémas domaine (`doc/domain/schemas/`) : SizeProfile, HarnessProfile, InterventionProfile, ParallelismProfile, AiddLevel
- Documentation du port `AiddLevelCalculatorPort` (`doc/domain/ports/`)

## Décisions architecturales

- Deux couches de schémas : infra (format LaivelUp) et domain (notre modèle)
- Les 4 axes parents toujours requis sur `DeveloperProfile`, leurs enfants nullables
- `DataSource` en `const` object pour découpler les références aux sources
- `AiddLevelCalculatorPort` dans le domain — implémentation `AiddReferentialLevelCalculatorService` dans domain/services
- Sources LLM (session, code, declaratif) hors scope du scoring déterministe pour l'instant
- Qualité de code (sonar coverage, bugs) non scorée : prérequis implicite du référentiel, capturée indirectement par l'axe Intervention
- `humanCommitRatio` = `1 - aiCoauthoredRatio` : signal clé pour le niveau Gold

## En attente

- Implémentation des entités domaine en TypeScript
- Implémentation du service de scoring `AiddReferentialLevelCalculatorService`
- Adapter LaivelUp (infra) : lecture fichiers → Zod → mapper → DeveloperProfile
