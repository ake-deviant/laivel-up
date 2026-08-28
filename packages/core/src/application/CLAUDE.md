# application

Orchestration des cas d'usage. Dépend uniquement du domain.

## Ce qui appartient ici
- Use cases : `use-cases/*.use-case.ts`
- Ports applicatifs : `ports/*.port.ts` (ex: `IProfileParser`)
- DTOs : `*.dto.ts`

## Ce qui n'appartient pas ici
- Imports depuis `infrastructure/` ou `presentation/`
- Librairies externes
- Logique métier (appartient au domain)

## Dépendances autorisées
`domain/` uniquement.
