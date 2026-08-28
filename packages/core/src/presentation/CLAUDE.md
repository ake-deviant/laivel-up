# presentation

Transformation des données domaine en structures lisibles pour l'UI.

## Ce qui appartient ici
- ViewModels : `*.view-model.ts`
- Presenters : `*.presenter.ts`
- Mappers de présentation : `*.mapper.ts`

## Ce qui n'appartient pas ici
- Imports depuis `infrastructure/`
- Composants UI (appartiennent à `app-nextjs`)
- Logique métier

## Dépendances autorisées
`domain/`, `application/` uniquement.
