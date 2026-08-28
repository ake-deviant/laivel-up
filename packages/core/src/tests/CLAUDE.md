# tests

Conventions de test pour le projet.

## Structure des tests

Miroir de `src/` : `tests/domain/`, `tests/application/`, `tests/infrastructure/`.

## Nommage des blocs describe / it

Les descriptions doivent être compréhensibles par quelqu'un du métier, sans connaissance technique.

- `describe` : nommer le comportement ou la règle métier testée, pas la classe
- `it` : formuler avec **when … it …** — décrire la situation puis le résultat attendu
- Langue : anglais (Règle 4 de RULES.md)

```ts
// ✅
describe('AIDD level calculator', () => {
  describe('when the developer has no AI data', () => {
    it('assigns White level on all axes', () => { ... });
  });
});

// ❌
describe('AiddReferentialLevelCalculatorService', () => {
  it('returns white', () => { ... });
});
```

## Structure interne des tests

Toujours découper en trois sections commentées :

```ts
it('...', () => {
  // arrange
  ...
  // act
  ...
  // assert
  ...
});
```

## Fixtures

Pattern Object Mother dans `tests/fixtures/`. Utiliser les méthodes statiques existantes avant d'en créer de nouvelles.
