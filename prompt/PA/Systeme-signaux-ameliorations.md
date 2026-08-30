# Plan — Système de signaux et d'améliorations par axe

## Objectif

Remplacer les events `worktree_data_missing` / `worktree_not_configured` par un système générique qui, pour chaque axe :
1. Détecte si chaque signal est validé ou non (matrice de signaux)
2. Dérive une liste d'améliorations (conditions manquantes pour le niveau suivant)

Le bus (`ILevelImprovementBus`) reste pour les améliorations transverses non couvertes par la matrice.

---

## Nouvelles entités domaine

### `Signal`
```
Signal
  ├── name: string           — identifiant du signal (ex: "medianCorrectionCommits")
  ├── validated: boolean     — condition atteinte ou non
  └── value: number | boolean | null   — valeur observée (optionnel, pour affichage)
```

### `AxisSignalMatrix`
```
AxisSignalMatrix
  ├── axis: ImprovementAxis
  ├── currentLevel: AiddLevelValue
  ├── nextLevel: AiddLevelValue | null   — null si déjà gold
  └── signals: Signal[]                  — signaux du niveau suivant uniquement
```

---

## Nouveau port domaine

### `IAxisSignalDetector<TProfile>`
```ts
interface IAxisSignalDetector<TProfile> {
  detect(profile: TProfile): AxisSignalMatrix;
}
```

Un détecteur par axe. Utilise la même config que le calculateur correspondant.

---

## Implémentations (une par axe)

| Détecteur | Profil consommé | Signaux exposés |
|---|---|---|
| `ParallelismSignalDetector` | `ParallelismProfile` | `medianConcurrentBranches`, `maxConcurrentBranches`, `hasWorktreeInclude` |
| `InterventionSignalDetector` | `InterventionProfile` | `medianCorrectionCommitsAfterOpen`, `humanCommitRatio`, `mergedWithoutHumanEditRatio`, `medianReviewCommentsReceived` |
| `SizeSignalDetector` | `SizeProfile` | `distribution.xl`, `distribution.l+xl` |
| `HarnessSignalDetector` | `HarnessProfile` | `contextEngineeringScore`, `aiConfigurationScore`, `ciMedianRunsToGreen` |

Chaque détecteur : calcule le niveau courant, identifie le niveau suivant, vérifie chaque condition du niveau suivant, retourne la matrice.

---

## Nouveau service domaine

### `AxisImprovementService`
```
AxisImprovementService.derive(matrices: AxisSignalMatrix[]): Improvement[]
```

Pour chaque matrice : liste les signaux non validés → produit un `Improvement` par signal manquant.

`Improvement` (enrichi) :
```
Improvement
  ├── axis: ImprovementAxis
  ├── targetLevel: AiddLevelValue
  └── type: string   — nom du signal manquant
```

---

## Évolution du use case

```
EvaluateDeveloperProfileUseCase.execute(profileId)
  1. repository.findById(profileId)
  2. triage
  3. evaluator.evaluate(profile)           → niveaux par axe (inchangé)
  4. detectors[].detect(profile.<axe>)     → 4 matrices
  5. AxisImprovementService.derive(matrices) → improvements
  6. return { niveaux, signalMatrices, improvements, busImprovements }
```

---

## Évolution de `DeveloperProfileResult`

```
DeveloperProfileResult
  ├── overallLevel, sizeLevel, harnessLevel, interventionLevel, parallelismLevel
  ├── signalMatrices: AxisSignalMatrix[]   — nouveau
  ├── improvements: Improvement[]          — désormais issus de AxisImprovementService
  └── busImprovements: Improvement[]       — issus du bus (transverses, ad-hoc)
```

---

## Évolution du presenter / ViewModel

`DeveloperProfileResultViewModel` s'enrichit :
- `axes[].signals: SignalViewModel[]` — détail par signal (name, validated, value)
- `improvements[]` — liste unifiée ou séparée selon choix UI

---

## IoC container

Ajouter un token et un binding par détecteur dans `di.ts` / `container.ts`.

---

## Suppression

- `worktree_data_missing` et `worktree_not_configured` supprimés une fois les détecteurs en place.

---

## Ordre d'implémentation

1. Entités `Signal` + `AxisSignalMatrix`
2. Port `IAxisSignalDetector`
3. `ParallelismSignalDetector` + tests
4. `InterventionSignalDetector` + tests
5. `SizeSignalDetector` + tests
6. `HarnessSignalDetector` + tests
7. `AxisImprovementService` + tests
8. Enrichissement `DeveloperProfileResult`
9. Évolution use case + IoC
10. Suppression events worktree + nettoyage bus
11. Presenter + ViewModel
12. UI (page)
