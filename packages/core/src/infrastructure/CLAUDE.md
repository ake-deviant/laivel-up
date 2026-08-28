# infrastructure

Implémentations concrètes des ports. Seule couche autorisée à dépendre de librairies externes.

## Ce qui appartient ici
- Parsers : `parsers/*.parser.ts` (ex: `ZodProfileParser`)
- Evaluateurs : `evaluators/*.evaluator.ts` (ex: `RuleBasedEvaluator`, `LLMEvaluator`)
- Repositories in-memory : `repositories/*.repository.ts`
- Adapters : `adapters/*.adapter.ts`

## Ce qui n'appartient pas ici
- Logique métier (appartient au domain)
- Imports depuis `presentation/`

## Dépendances autorisées
`domain/`, `application/`, librairies externes (zod...).

## Règle de validation
Zod valide uniquement la forme des données (types, présence/absence de champs). Aucune règle métier dans les schemas Zod — la sémantique appartient au domain.

## Conventions de nommage
- Données brutes venant de l'extérieur (avant validation/mapping) : suffixe `Input`
  - ex: `DeveloperProfileInput`, `AssessmentInput`
- Objets métiers domaine : aucun suffixe
  - ex: `DeveloperProfile`, `AssessmentResult`
- Mappers infra → domaine : `*.mapper.ts` dans `mappers/`
