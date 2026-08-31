# Plan — Sélection d'algorithmes par axe

## Objectif

Permettre à l'utilisateur de choisir, depuis la page de configuration, l'algorithme utilisé pour calculer le `level` de chaque axe.

Le système doit :

- proposer plusieurs implémentations pour un même axe ;
- expliquer brièvement la logique métier de chaque implémentation ;
- persister le choix dans `EvaluationConfig` ;
- transmettre le choix à l'API d'évaluation ;
- construire l'implémentation sélectionnée au moment de l'évaluation ;
- garantir la cohérence entre le calculator, les signals et les `improvementOpportunities` ;
- permettre de retirer une implémentation sans modifier les consommateurs du calculator.
- conserver une configuration initiale de référence ;
- permettre à l'utilisateur de restaurer cette configuration depuis l'UI.

## Configuration initiale de référence

### Constat

Les valeurs par défaut de `EvaluationConfig` sont actuellement dupliquées :

- le hook `useEvaluatorConfig` contient son propre objet `DEFAULT` ;
- le `POST /api/evaluate/[profileId]` construit un autre `DEFAULT_CONFIG` ;
- une partie des valeurs provient des configs exportées par `core`, tandis que `nonBlockingAxes` est redéclaré localement.

Cette duplication peut produire une configuration initiale différente entre le client et le serveur.

### Source unique

Créer une source de vérité partagée par le client et le serveur :

```typescript
createDefaultEvaluationConfig(): EvaluationConfig
```

La factory doit construire une nouvelle valeur à chaque appel à partir de :

- `defaultParallelismThresholdsConfig.weights` ;
- `defaultHarnessThresholdsConfig.contextEngineeringWeights` ;
- `defaultHarnessThresholdsConfig.aiConfigurationWeights` ;
- `nonBlockingAxes: ['velocity']` ;
- `algorithms.parallelism: 'weighted'`.

Une factory est préférée à l'export d'un objet mutable partagé. Elle empêche qu'une modification locale altère accidentellement la configuration initiale utilisée par les appels suivants.

Les configs domaine existantes restent les sources de vérité de leurs seuils et poids. La nouvelle factory assemble uniquement la configuration complète attendue par l'application.

### Compatibilité des configurations enregistrées

Au chargement du `localStorage` :

- partir de `createDefaultEvaluationConfig()` ;
- fusionner la configuration enregistrée ;
- fusionner séparément les objets imbriqués ;
- compléter tout nouveau champ absent avec sa valeur initiale ;
- remplacer un identifiant d'algorithme inconnu par la valeur initiale.

Une fusion uniquement au premier niveau n'est pas suffisante pour faire évoluer les configs imbriquées sans perdre de nouvelles valeurs par défaut.

## Réinitialisation depuis l'UI

Ajouter à la page config un bouton :

```text
Rétablir la configuration initiale
```

Ce bouton doit restaurer en une seule action :

- `nonBlockingAxes` ;
- `parallelismWeights` ;
- `harnessContextWeights` ;
- `harnessAiWeights` ;
- toutes les sélections présentes dans `algorithms` ;
- les futurs champs de `EvaluationConfig` fournis par la factory.

Comportement attendu :

1. demander une confirmation explicite, car l'action remplace tous les ajustements locaux ;
2. appeler `createDefaultEvaluationConfig()` ;
3. remplacer entièrement l'état courant, sans fusion avec l'ancienne valeur ;
4. écrire la nouvelle configuration dans `localStorage` ;
5. mettre à jour immédiatement tous les contrôles de la page ;
6. afficher une confirmation courte de la restauration.

Le hook `useEvaluatorConfig` doit exposer une opération dédiée :

```typescript
reset(): void
```

La page ne doit pas reconstruire elle-même les valeurs initiales.

## Point d'extension existant

Chaque axe expose déjà une interface de calculator :

- `ISizeLevelCalculator` ;
- `IHarnessLevelCalculator` ;
- `IInterventionLevelCalculator` ;
- `IParallelismLevelCalculator` ;
- `IVelocityLevelCalculator`.

`parallelism` possède en plus `IParallelismScoringStrategy`. Il constitue donc le premier cas le plus simple pour mettre en place le système sans remplacer tout le calculator.

Les interfaces de configuration actuelles paramètrent une implémentation, mais ne la sélectionnent pas. La sélection doit être ajoutée à la composition de l'application.

## Premier cas — `parallelism`

### Algorithme existant

Identifiant proposé : `weighted`.

Logique métier :

```text
score = medianConcurrentBranches × median weight
      + maxConcurrentBranches × max weight
```

La médiane représente l'usage habituel. Le maximum ajoute un signal secondaire sur la capacité maximale observée.

### Nouvel algorithme

Identifiant proposé : `median-only`.

Logique métier :

```text
score = medianConcurrentBranches × median weight
```

Le maximum est ignoré. Seule la pratique habituelle contribue au score, afin qu'un pic isolé ne puisse jamais faire progresser le `parallelismLevel`.

Les conditions de `level` existantes restent inchangées, notamment `requiresWorktree` pour `gold`.

### Intérêt du premier cas

- l'interface `IParallelismScoringStrategy` existe déjà ;
- la nouvelle implémentation est courte ;
- les deux logiques sont compréhensibles dans l'UI ;
- la différence est observable sur les profils dont `maxConcurrentBranches` est nettement supérieur à `medianConcurrentBranches` ;
- l'implémentation est éjectable sans modifier `AiddReferentialLevelCalculatorService`.

## Modèle de configuration

Ajouter une sélection typée par axe :

```typescript
export type ParallelismAlgorithm = 'weighted' | 'median-only';

export interface EvaluationAlgorithmsConfig {
  parallelism: ParallelismAlgorithm;
}

export interface EvaluationConfig {
  algorithms: EvaluationAlgorithmsConfig;
  // configuration existante
}
```

Le système pourra ensuite être étendu avec une union propre à chaque axe :

```typescript
export interface EvaluationAlgorithmsConfig {
  size: SizeAlgorithm;
  harness: HarnessAlgorithm;
  intervention: InterventionAlgorithm;
  parallelism: ParallelismAlgorithm;
  velocity: VelocityAlgorithm;
}
```

Pour le premier incrément, seul `parallelism` doit être ajouté. Les autres axes ne doivent pas recevoir de valeur artificielle tant qu'ils ne proposent qu'une implémentation.

## Valeur par défaut et compatibilité

- `weighted` reste la valeur par défaut ;
- une configuration enregistrée avant l'ajout du champ doit continuer à fonctionner ;
- l'absence de `algorithms.parallelism` doit sélectionner `weighted` ;
- une valeur inconnue reçue par l'API doit être rejetée ou remplacée explicitement par la valeur par défaut ;
- le changement d'algorithme ne doit pas effacer les poids enregistrés ;
- lorsque `median-only` est sélectionné, `max weight` est conservé mais n'est pas utilisé.
- la réinitialisation restaure `weighted` et tous les poids initiaux.

## Catalogue UI

Créer un catalogue typé contenant uniquement les informations de présentation :

```typescript
interface AlgorithmOption<TId extends string> {
  id: TId;
  label: string;
  description: string;
  formula: string;
}
```

Options initiales pour `parallelism` :

- `Pondéré` : la médiane porte l'usage habituel et le maximum ajoute un signal secondaire ;
- `Médiane uniquement` : seul l'usage habituel compte, les pics sont ignorés.

Le catalogue UI ne construit pas les services du domaine. Il expose uniquement les identifiants autorisés et leurs explications.

## UI de configuration

Ajouter dans la section `parallelism` :

- un groupe intitulé `Algorithme` ;
- une carte sélectionnable par implémentation ;
- le nom de l'algorithme ;
- une description métier courte ;
- la formule utilisée ;
- un état sélectionné accessible avec `aria-pressed`.

Comportement des poids :

- `weighted` affiche `median weight` et `max weight` ;
- `median-only` affiche uniquement `median weight` ;
- `max weight` reste stocké pour être restauré si l'utilisateur revient à `weighted` ;
- le changement est enregistré par le même mécanisme `localStorage` que le reste de `EvaluationConfig`.

## Construction des implémentations

Ajouter une factory de composition qui retourne `IParallelismScoringStrategy` à partir de `ParallelismAlgorithm`.

```typescript
createParallelismScoringStrategy(
  algorithm: ParallelismAlgorithm,
  weights: ParallelismWeights,
): IParallelismScoringStrategy
```

La factory doit construire :

- `WeightedParallelismScoringStrategy` pour `weighted` ;
- `MedianOnlyParallelismScoringStrategy` pour `median-only`.

`WeightedParallelismLevelCalculatorService` continue de dépendre uniquement de `IParallelismScoringStrategy`. Il ne doit pas connaître les identifiants provenant de l'UI.

## Cohérence des résultats

Le code actuel duplique la formule pondérée dans :

- `WeightedParallelismScoringStrategy` ;
- `ParallelismSignalDetectorService` ;
- `ParallelismImprovementOpportunityDetector`.

Changer uniquement le calculator produirait un `parallelismLevel` incompatible avec ses signals et ses `improvementOpportunities`.

La même instance de `IParallelismScoringStrategy` doit donc être utilisée par :

- `IParallelismLevelCalculator` ;
- `ParallelismSignalDetectorService` ;
- `ParallelismImprovementOpportunityDetector` lorsque celui-ci a besoin du score.

Les calculs directs basés sur `weights.median` et `weights.max` doivent être retirés de ces consommateurs.

Pour calculer une suggestion sur `medianConcurrentBranches` sans connaître la formule interne, le detector peut simuler des valeurs croissantes avec le calculator jusqu'au prochain `level`, dans une limite explicite. Il ne doit pas reconstruire la formule de la strategy.

## API

Le `POST /api/evaluate/[profileId]` doit :

- lire `algorithms.parallelism` ;
- appliquer `weighted` en cas d'absence pour la compatibilité ;
- valider l'identifiant avant la construction des services ;
- transmettre la sélection à `buildEvaluateUseCase` ;
- ne jamais accepter un nom de classe ou un chemin de module provenant du client.

Le client sélectionne un identifiant autorisé. Le serveur conserve la responsabilité de l'associer à une implémentation connue.

## Injection et cycle de vie

Les services dépendant de la sélection ne doivent plus être récupérés depuis les bindings par défaut lorsqu'une évaluation dynamique est construite.

`buildEvaluateUseCase` doit construire un ensemble cohérent pour la requête :

1. la strategy sélectionnée ;
2. le calculator `parallelism` ;
3. le signal detector `parallelism` ;
4. le detector d'`improvementOpportunities` concerné ;
5. les services applicatifs qui consomment ces instances.

Les autres axes continuent d'utiliser les bindings existants.

## Tests du premier cas

### Domaine

- `WeightedParallelismScoringStrategy` conserve la formule actuelle ;
- `MedianOnlyParallelismScoringStrategy` ignore `maxConcurrentBranches` ;
- les valeurs `null` valent zéro ;
- deux profils ayant la même médiane mais des maximums différents obtiennent le même score avec `median-only` ;
- les deux algorithms peuvent produire des `parallelismLevel` différents pour un même profil ;
- `requiresWorktree` continue de s'appliquer à `gold` ;
- les signals utilisent le même score que le calculator ;
- les `improvementOpportunities` restent cohérentes avec l'algorithme sélectionné.

### Application

- l'absence de sélection utilise `weighted` ;
- `weighted` construit l'implémentation existante ;
- `median-only` construit la nouvelle implémentation ;
- une valeur inconnue ne construit aucun service arbitraire ;
- le choix modifie effectivement le résultat lorsque le profil permet de distinguer les deux algorithms.

### UI

- les deux cartes sont affichées ;
- la carte active expose son état avec `aria-pressed` ;
- le choix est persisté ;
- `max weight` est masqué avec `median-only` et restauré avec `weighted` ;
- la requête d'évaluation contient l'identifiant sélectionné.
- le bouton de réinitialisation demande confirmation ;
- l'annulation conserve la configuration courante ;
- la confirmation restaure tous les champs ;
- la configuration restaurée reste active après rechargement de la page.

## Ordre d'implémentation

1. Ajouter `ParallelismAlgorithm` et faire évoluer `EvaluationConfig`.
2. Ajouter `createDefaultEvaluationConfig` et supprimer les valeurs initiales dupliquées.
3. Ajouter la fusion compatible des anciennes configurations enregistrées.
4. Ajouter `reset` à `useEvaluatorConfig` et son bouton dans l'UI.
5. Exporter l'implémentation existante de `IParallelismScoringStrategy` si nécessaire.
6. Ajouter `MedianOnlyParallelismScoringStrategy`.
7. Ajouter la factory de strategies autorisées.
8. Injecter la strategy dans le calculator et le signal detector.
9. Rendre `ParallelismImprovementOpportunityDetector` indépendant de la formule pondérée.
10. Construire l'ensemble cohérent dans `buildEvaluateUseCase`.
11. Valider la sélection dans l'API.
12. Ajouter le catalogue UI et le sélecteur dans la page config de prévisualisation.
13. Ajouter les tests domaine, application et UI disponibles dans le projet.
14. Comparer les deux résultats sur au moins un profil existant.
15. Documenter l'ajout d'un nouvel algorithme et son retrait.

## Éjection d'une implémentation

Pour retirer un algorithme :

1. retirer son option du catalogue UI ;
2. retirer son association dans la factory ;
3. migrer sa valeur enregistrée vers l'algorithme par défaut ;
4. supprimer sa classe et ses tests spécifiques ;
5. conserver inchangées les interfaces consommées par les services.

Aucun composant ne doit importer directement une classe d'algorithme, et aucun identifiant d'algorithme ne doit être interprété dans le domaine en dehors de la factory de composition.

## Cas suivant proposé

Après validation du système sur `parallelism`, le cas suivant proposé est `harness` :

- algorithme existant par scores cumulés ;
- nouvel algorithme par conditions obligatoires non compensables.

Ce second cas permettra de valider que le système sait remplacer un calculator complet et pas uniquement une scoring strategy. Sa logique métier devra faire l'objet d'une validation distincte avant implémentation.

## Critères de fin

- l'utilisateur peut choisir entre `weighted` et `median-only` pour `parallelism` ;
- chaque choix est expliqué dans l'UI ;
- la sélection persiste et atteint l'API ;
- le calculator, les signals et les `improvementOpportunities` utilisent le même algorithme ;
- l'algorithme existant reste le fallback ;
- une source unique fournit la configuration initiale au client et au serveur ;
- l'utilisateur peut restaurer toute la configuration initiale depuis l'UI ;
- le système peut accueillir un deuxième axe sans modifier son principe de composition ;
- `median-only` peut être retiré sans modifier les consommateurs de `IParallelismScoringStrategy` ou `IParallelismLevelCalculator`.
