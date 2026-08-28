# domain

Règles métier pures. Aucune dépendance externe, aucun import depuis les autres couches.

## Ce qui appartient ici
- Entités : aucun suffixe (ex: `developer-profile.ts`, `aidd-level-value.ts`)
- Erreurs métier : `*.error.ts` (étendent `DomainError`)
- Ports domaine : `*.port.ts` (ex: `IProfileEvaluator`)
- Utilitaires partagés : `shared/` (`Result<T,E>`)

## Ce qui n'appartient pas ici
- Librairies externes (zod, axios...)
- Imports depuis `application/`, `infrastructure/`, `presentation/`

## Dépendances autorisées
Aucune. TypeScript pur uniquement.

## Règle de validation
Les règles métier (signification des champs null, critères de validité d'un profil, niveaux de confiance) appartiennent au domain, pas à l'infrastructure.
