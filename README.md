# Laivel Up

Outil d'évaluation du niveau AI-Driven Development d'un développeur selon un référentiel à 7 niveaux et 4 axes.

## Les niveaux

| Niveau | Taille | Harness | Intervention | Parallèle |
|---|---|---|---|---|
| ❖ White | — | — | — | 0 |
| 🔺 Red | S | prompts | après coup, majorité | 1 |
| 🔹 Blue | M | context engineering | après coup, partie | 1 |
| 🟢 Green | L | + behavior | étapes clés | 1 |
| 🥉 Copper | L-XL | + behavior | étapes clés | 3 |
| 🥈 Silver | L-XL | + loops | jamais (post-cadrage) | 3 |
| 🥇 Gold | L-XL | + loops | jamais (cadrage compris) | 3 |

> Un niveau n'est atteint que si **tous ses axes** le sont.

## Architecture

Monorepo npm workspaces — `packages/core` contient toute la logique métier (framework-agnostic).

```
domain/         → entités, ports, services de calcul
application/    → use cases, ports applicatifs
infrastructure/ → parsers, mappers, repositories
tests/          → fixtures, scénarios, specs
```

## Lancer les tests

```bash
npm install
npm test
```

## Thresholds configurables

Le référentiel ne fixe pas les valeurs exactes. Tous les levels sont configurables via `SizeThresholdsConfig` injectée au service.

Config par défaut : `packages/core/src/domain/services/size-thresholds.config.ts`

| Level | Paramètre | Valeur par défaut |
|---|---|---|
| white | minXs | 0% |
| red | minS | 50% |
| blue | minM | 50% |
| green | minL | 50% |
| copper | minXl / minLXl | 20% / 50% |
| silver | minXl / minLXl | 20% / 60% |
| gold | minXl / minLXl | 40% / 60% |

```typescript
new SizeLevelCalculatorService({
  white:  { minXs: 0 },
  red:    { minS: 0.5 },
  blue:   { minM: 0.5 },
  green:  { minL: 0.5 },
  copper: { minXl: 0.2, minLXl: 0.5 },
  silver: { minXl: 0.2, minLXl: 0.6 },
  gold:   { minXl: 0.4, minLXl: 0.6 },
});
```
