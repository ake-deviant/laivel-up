# CLAUDE.md — Laivel Up

## Projet
Outil d'évaluation de la maîtrise des développeurs en AI-Driven Development.
Hackathon Laivel Up — 72h.

## Structure
Monorepo npm workspaces :
- `packages/core` — logique métier pure, framework-agnostic
- `packages/app-nextjs` — interface Next.js 15, App Router

## Règles de collaboration
Lire `prompt/RULES.md` avant toute action.

## Approche
- TDD : tests avant implémentation
- Algorithme déterministe (pas de LLM) pour les évaluations
- Les décisions architecturales appartiennent exclusivement à l'utilisateur

## Tests
- Tests uniquement dans `packages/core`
- Runner : Vitest
- Données de test : Object Mother pattern (`tests/fixtures/`)
- `npm test` depuis la racine pour lancer tous les tests

## Conventions générales
- Langue : français pour les messages, anglais pour le code
- Nommage fichiers : kebab-case
- Pas de commentaires sauf contrainte non-évidente
- Données brutes venant de l'extérieur : suffixe `Input` (ex: `DeveloperProfileInput`)
- Toujours inclure le nom de l'objet métier dans le nommage (ex: `DeveloperProfileTriageService`, `DeveloperProfileResult`, `DeveloperProfileMapper`)
