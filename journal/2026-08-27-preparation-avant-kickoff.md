# 2026-08-27 — Préparation avant kickoff

Hackathon Laivel Up — kickoff demain 12h.

## Ce qui a été fait

- Clonage de l'archétype frontend clean architecture
- Suppression des apps Angular et React, conservation de Next.js 15
- Migration Jest → Vitest
- Installation Tailwind v4 et Zod
- Structure de dossiers clean architecture prête
- `ZodProfileParser` dans `core/infrastructure`, Zod découplé de Next.js
- Premier test écrit et passant : `ZodProfileParser` (4 cas)
- Données de test centralisées pour survivre aux changements de schéma

## Décisions architecturales

- Algorithme de scoring déterministe (pas de LLM) pour des résultats reproductibles et explicables
- Port `IProfileEvaluator` dans le domain — implémentation `RuleBasedEvaluator` en infrastructure
- Parser Zod découplé derrière un port `IProfileParser`
- Object Mother pattern pour les fixtures de test
- InMemoryRepository pour les tests, Docker JSON Server pour le dev

## En attente

Schéma des données et critères d'évaluation officiels — fournis au kickoff demain 12h.
