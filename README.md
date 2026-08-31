# Laivel Up

Framework d'évaluation du niveau AI-Driven Development. Il pose un cadre modulaire : des axes, des algorithmes, des seuils — chaque couche est remplaçable sans toucher aux autres. Plusieurs équipes peuvent faire tourner la même instance avec des critères entièrement différents.

Le scoring est déterministe. Aucun LLM n'intervient dans le calcul. Le verdict est reproductible à données égales.

→ [Méthodologie](methodologie.md) · [Référence technique](reference.md)

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

> Un niveau n'est atteint que si **tous ses axes bloquants** le sont.

6 axes sont évalués : Size, Harness, Intervention, Parallelism (référentiel), Velocity et Delivery Confidence (extensions). Les deux extensions sont non-bloquantes par défaut — configurable.

## Démarrage

```bash
npm install

# Préparer la configuration locale
cp packages/app-nextjs/.env.example packages/app-nextjs/.env.local

# Ajouter un profile fictif sous data/profiles/profiles
# Voir la documentation Profiles ci-dessous

# Application, depuis la racine
npm run dev --workspace=packages/app-nextjs

# Tests
npm test
```

→ [Installer ou ajouter des profiles](doc/profiles.md)

## Modularité

**Via l'interface — sans toucher au code.**
Trois axes proposent plusieurs algorithmes sélectionnables depuis la page Config :

| Axe | Algorithmes disponibles |
|---|---|
| Size | `dominant-distribution` · `weighted-average` |
| Harness | `weighted-score` · `capability-gates` |
| Parallelism | `weighted` · `median-only` |

Les poids, seuils et axes bloquants sont également ajustables depuis l'UI. La configuration est persistée et envoyée à chaque évaluation. Un bouton restaure les valeurs initiales.

**Multi-utilisateurs.** Chaque appel embarque sa propre configuration. Deux jurys utilisant la même instance peuvent appliquer des algorithmes et des seuils différents — rien n'est partagé entre leurs sessions.

**Extensibilité dans le code.** L'architecture sépare strictement chaque axe de ses voisins.

Ajouter un axe = implémenter son calculateur + son détecteur de signaux + son détecteur d'opportunités, puis le déclarer dans le container IoC (`packages/app-nextjs/src/di/`) :
1. Déclarer un token dans `di.ts`
2. Binder le service dans `container.ts`
3. L'injecter dans `AiddReferentialLevelCalculatorService`

Ajouter un algorithme sur un axe existant = brancher une nouvelle implémentation derrière l'interface existante (`IParallelismScoringStrategy`, `ISizeLevelCalculator`, etc.). Retirer un algorithme ne casse aucun consommateur.

## Architecture

Monorepo npm workspaces — `packages/core` contient toute la logique métier (framework-agnostic).

```
domain/         → entités, ports, services de calcul
application/    → use cases, ports applicatifs
infrastructure/ → parsers, mappers, repositories
tests/          → fixtures, scénarios, specs
```

## Axe Size — calcul du niveau

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

Algorithme alternatif `weighted-average` : `XS×0 + S×1 + M×2 + L×3 + XL×4`, avec seuils configurables par level.

## Axe Harness — calcul du niveau

Config par défaut : `packages/core/src/domain/services/harness-thresholds.config.ts`

| Level | Condition | Valeur |
|---|---|---|
| white | aucun signal IA détecté | — |
| red | ratio commits IA, sans fichier de contexte | > 0 |
| blue | score context engineering | ≥ 16 |
| copper | score context engineering **et** score AI configuration | ≥ 16 **et** ≥ 12 |
| gold | score context engineering **et** score AI configuration **et** runs CI | ≥ 16 **et** ≥ 12 **et** ≤ 1 |

Poids par défaut (context engineering / AI configuration) :

| Signal | Pts | Signal | Pts |
|---|---|---|---|
| CLAUDE.md | 4 | hooks | 4/fichier |
| mémoire | 4 | rules | 4/fichier |
| specs | 3 | AGENTS.md | 3 |
| plans | 3 | agents | 3/fichier |
| tasks | 3 | skills | 3/fichier |
| brainstorm | 2 | settings.json | 2 |
| context | 2 | | |

Algorithme alternatif `capability-gates` : chaque level exige une chaîne complète. Un signal absent ne peut pas être compensé par un autre.

## Axe Parallelism — calcul du niveau

Score pondéré sur `medianConcurrentBranches` (usage habituel) et `maxConcurrentBranches` (signal secondaire). Le worktree (`hasWorktreeInclude`) est un gate requis pour gold, pas une pondération.

Config par défaut : `packages/core/src/domain/services/parallelism-thresholds.config.ts`

| Level | minScore | Condition |
|---|---|---|
| red | 7 | — |
| blue | 10 | — |
| green | 15 | — |
| copper | 20 | — |
| silver | 25 | — |
| gold | 30 | worktree requis |

Poids par défaut : `median × 5 + max × 1`. Algorithme alternatif `median-only` : seule la médiane contribue au score.

## Axe Intervention — calcul du niveau

Conditions multi-signaux évaluées du level le plus haut au plus bas. Premier level dont toutes les conditions sont satisfaites.

Config par défaut : `packages/core/src/domain/services/intervention-thresholds.config.ts`

| Level | `medianCorrectionCommits` | `humanCommitRatio` | `mergedWithoutHumanEditRatio` | `medianReviewComments` |
|---|---|---|---|---|
| gold | = 0 | = 0 | = 1 | — |
| silver | = 0 | ≤ 0.15 | ≥ 0.50 | ≤ 2 |
| copper | ≤ 1 | — | — | ≤ 3 |
| blue | ≤ 3 | — | — | ≤ 5 |
| red | fallback si signal IA présent | | | |
| white | fallback final | | | |

> **Green sauté :** green et copper partagent la même description d'intervention. Le plus haut est attribué — les autres axes trancheront le niveau global.

> **"Plusieurs PR par jour" (condition gold du référentiel) :** non implémenté. Les données disponibles ne fournissent pas de distribution journalière fiable.

## Système d'amélioration

Pendant le calcul, chaque axe émet des événements quand un profil frôle un level sans l'atteindre. Ces événements sont collectés par `ImprovementCollector` et renvoyés dans la réponse.

```
ILevelImprovementBus.emit(event)
  └── ImprovementCollector  →  improvements: Improvement[]  →  DeveloperProfileResult
```

Le mécanisme est transverse : chaque calculateur reçoit le bus en injection, sans couplage au use case.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
