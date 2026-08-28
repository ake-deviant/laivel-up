# AiddLevelCalculatorPort

```ts
interface AiddLevelCalculatorPort {
  calculate(profile: DeveloperProfile): AiddLevel
}
```

| | Type | Description |
|---|---|---|
| entrée | `DeveloperProfile` | Profil domaine du développeur |
| sortie | `AiddLevel` | Niveau calculé par axe et global |

## Implémentations

| Classe | Description |
|---|---|
| `AiddReferentialLevelCalculatorService` | Applique le référentiel AIDD (7 niveaux, 4 axes) |
