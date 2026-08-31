# Schéma proposé — axe transversal `deliveryConfidence`

## Intention

`deliveryConfidence` estime dans quelle mesure une DSI peut confier à un développeur un sujet important, complexe et incertain avec la confiance qu'il produira une valeur utile, prévisible, maintenable et sûre.

Le nom, les champs, les pondérations et les seuils présentés ici constituent une proposition d'analyse et non une décision d'implémentation.

## Principes de mesure

- L'axe évalue des résultats et leurs conséquences, pas le volume brut d'activité.
- Une période, un rôle et un contexte comparables sont nécessaires avant toute comparaison.
- Une métrique absente reste `null` et ne devient jamais artificiellement `0`.
- La qualité et le risque constituent des conditions obligatoires et ne peuvent pas être compensés entièrement par la vitesse.
- Le résultat expose séparément le level, le score et la confiance accordée aux données.
- Les données individuelles sensibles, les horaires et la surveillance comportementale sont exclus.

## Structure racine

```typescript
interface DeliveryConfidenceProfile {
  context: DeliveryConfidenceContext;
  businessImpact: BusinessImpactProfile;
  deliveryReliability: DeliveryReliabilityProfile;
  qualityAndRisk: QualityAndRiskProfile;
  autonomy: AutonomyProfile;
  collectiveImpact: CollectiveImpactProfile;
  complexity: ComplexityProfile;
  aiEffectiveness: AiEffectivenessProfile;
}
```

| Champ | Type | Explication |
|---|---|---|
| `context` | `DeliveryConfidenceContext` | Décrit le cadre indispensable à l'interprétation équitable des mesures. |
| `businessImpact` | `BusinessImpactProfile` | Regroupe les résultats métier produits par le travail livré. |
| `deliveryReliability` | `DeliveryReliabilityProfile` | Regroupe la prévisibilité, la cadence et la continuité de livraison. |
| `qualityAndRisk` | `QualityAndRiskProfile` | Regroupe les conséquences techniques, opérationnelles et de sécurité. |
| `autonomy` | `AutonomyProfile` | Regroupe la capacité à avancer, décider et solliciter une aide pertinente. |
| `collectiveImpact` | `CollectiveImpactProfile` | Regroupe l'effet du développeur sur les autres et sur l'organisation. |
| `complexity` | `ComplexityProfile` | Qualifie la difficulté réelle des sujets servant de base à l'évaluation. |
| `aiEffectiveness` | `AiEffectivenessProfile` | Mesure si l'usage de l'IA améliore réellement la livraison sans dégrader la maîtrise. |

## Contexte d'évaluation

```typescript
interface DeliveryConfidenceContext {
  periodStart: string;
  periodEnd: string;
  activeDays: number | null;
  expectedRole: string | null;
  productCriticality: 'low' | 'medium' | 'high' | 'critical' | null;
  codebaseMaturity: 'legacy' | 'transitioning' | 'established' | 'greenfield' | null;
  teamStability: number | null;
  supportWorkRatio: number | null;
  incidentWorkRatio: number | null;
  availableSources: string[];
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `periodStart` | `string` | Nouvelle | Date ISO marquant le début de la période évaluée. |
| `periodEnd` | `string` | Nouvelle | Date ISO marquant la fin de la période évaluée. |
| `activeDays` | `number \| null` | Nouvelle | Nombre de jours réellement travaillés pendant la période afin de normaliser les volumes. |
| `expectedRole` | `string \| null` | Existante : `profile.role` | Rôle attendu servant à interpréter le niveau de responsabilité observé. |
| `productCriticality` | `enum \| null` | Nouvelle | Criticité du produit qui pondère l'importance des risques et des incidents. |
| `codebaseMaturity` | `enum \| null` | Nouvelle | État du codebase qui contextualise la vitesse, la dette et la difficulté des changements. |
| `teamStability` | `number \| null` | Nouvelle | Ratio entre membres présents sur toute la période et membres ayant participé à l'équipe. |
| `supportWorkRatio` | `number \| null` | Nouvelle | Part de la capacité consacrée au support plutôt qu'au développement planifié. |
| `incidentWorkRatio` | `number \| null` | Nouvelle | Part de la capacité consacrée au traitement d'incidents de production. |
| `availableSources` | `string[]` | Existante : `availableSources` | Liste les sources effectivement disponibles pour calculer la confiance des données. |

## Valeur métier

```typescript
interface BusinessImpactProfile {
  featuresCompletedCount: number | null;
  featuresAdoptedRatio: number | null;
  businessOutcomeAchievementRatio: number | null;
  abandonedWorkRatio: number | null;
  reworkRatio: number | null;
  timeToFirstValueDays: number | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `featuresCompletedCount` | `number \| null` | Partiellement existante : `velocity.featuresPerSprint` | Nombre de fonctionnalités satisfaisant la définition de terminé pendant la période. |
| `featuresAdoptedRatio` | `number \| null` | Nouvelle | Part des fonctionnalités livrées qui atteignent le seuil d'utilisation défini par le produit. |
| `businessOutcomeAchievementRatio` | `number \| null` | Nouvelle | Part des objectifs métier mesurables atteints parmi ceux associés aux livraisons. |
| `abandonedWorkRatio` | `number \| null` | Nouvelle | Part du travail commencé puis abandonné sans produire de valeur exploitable. |
| `reworkRatio` | `number \| null` | Nouvelle | Part de l'effort consacré à reprendre une livraison précédemment considérée comme terminée. |
| `timeToFirstValueDays` | `number \| null` | Nouvelle | Durée médiane entre le démarrage d'un sujet et sa première valeur utilisable. |

## Fiabilité de livraison

```typescript
interface DeliveryReliabilityProfile {
  commitmentCompletionRatio: number | null;
  deliveryForecastAccuracy: number | null;
  scopeChangeAbsorptionRatio: number | null;
  blockedTimeRatio: number | null;
  dependencyWaitingTimeDays: number | null;
  medianCycleTimeDays: number | null;
  completionRate: number | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `commitmentCompletionRatio` | `number \| null` | Nouvelle | Part des engagements annoncés qui sont terminés dans la période convenue. |
| `deliveryForecastAccuracy` | `number \| null` | Nouvelle | Proximité entre la date de livraison annoncée et la date de livraison réelle. |
| `scopeChangeAbsorptionRatio` | `number \| null` | Nouvelle | Part des changements de périmètre absorbés sans échec de l'objectif ni dérive majeure. |
| `blockedTimeRatio` | `number \| null` | Nouvelle | Part du cycle de livraison durant laquelle le travail reste bloqué. |
| `dependencyWaitingTimeDays` | `number \| null` | Nouvelle | Durée médiane d'attente causée par une dépendance externe au développeur. |
| `medianCycleTimeDays` | `number \| null` | Existante : `velocity.medianDaysTicketToPr` à compléter | Durée médiane entre la prise en charge d'un sujet et sa mise à disposition effective. |
| `completionRate` | `number \| null` | Existante : `velocity.completionRate` | Part du travail engagé qui est terminé dans le cycle prévu. |

## Qualité et risque

```typescript
interface QualityAndRiskProfile {
  changeFailureRate: number | null;
  escapedDefectRate: number | null;
  regressionRate: number | null;
  rollbackRate: number | null;
  hotfixRate: number | null;
  defectResolutionTimeDays: number | null;
  criticalCodeWithoutTestsRatio: number | null;
  testCoverageDelta: number | null;
  technicalDebtIntroducedRatio: number | null;
  technicalDebtResolvedRatio: number | null;
  securityIssueIntroductionRate: number | null;
  securityIssueResolutionTimeDays: number | null;
  productionIncidentContributionRate: number | null;
  incidentRecoveryContributionScore: number | null;
  observabilityCoverageRatio: number | null;
  rollbackPreparedRatio: number | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `changeFailureRate` | `number \| null` | Nouvelle | Part des mises en production entraînant incident, dégradation, correctif urgent ou rollback. |
| `escapedDefectRate` | `number \| null` | Nouvelle | Nombre de défauts découverts après livraison rapporté au nombre de changements livrés. |
| `regressionRate` | `number \| null` | Nouvelle | Part des changements responsables de la réapparition ou de la création d'un comportement défaillant. |
| `rollbackRate` | `number \| null` | Nouvelle | Part des mises en production nécessitant un retour à une version antérieure. |
| `hotfixRate` | `number \| null` | Nouvelle | Part des livraisons suivies d'une correction urgente non planifiée. |
| `defectResolutionTimeDays` | `number \| null` | Nouvelle | Durée médiane de résolution des défauts attribués aux changements évalués. |
| `criticalCodeWithoutTestsRatio` | `number \| null` | Nouvelle | Part du code critique modifié sans validation automatisée associée. |
| `testCoverageDelta` | `number \| null` | Partiellement existante : `sonar-measures.json` | Évolution de la couverture automatisée sur le périmètre réellement modifié. |
| `technicalDebtIntroducedRatio` | `number \| null` | Partiellement existante : `sonar-measures.json` | Dette technique nouvellement introduite rapportée à la taille des changements. |
| `technicalDebtResolvedRatio` | `number \| null` | Partiellement existante : `sonar-measures.json` | Dette technique supprimée rapportée à la dette présente dans les zones modifiées. |
| `securityIssueIntroductionRate` | `number \| null` | Nouvelle | Nombre de problèmes de sécurité introduits rapporté au nombre de changements livrés. |
| `securityIssueResolutionTimeDays` | `number \| null` | Nouvelle | Durée médiane de correction des problèmes de sécurité attribués au périmètre évalué. |
| `productionIncidentContributionRate` | `number \| null` | Nouvelle | Part des changements ayant contribué directement ou indirectement à un incident de production. |
| `incidentRecoveryContributionScore` | `number \| null` | Nouvelle | Score normalisé représentant l'efficacité de la contribution aux diagnostics et restaurations de service. |
| `observabilityCoverageRatio` | `number \| null` | Nouvelle | Part des changements à risque accompagnés des logs, métriques ou alertes nécessaires. |
| `rollbackPreparedRatio` | `number \| null` | Nouvelle | Part des changements à risque disposant d'une procédure de retour testable. |

## Autonomie

```typescript
interface AutonomyProfile {
  independentDeliveryRatio: number | null;
  clarificationRequestQuality: number | null;
  escalationRelevanceRatio: number | null;
  decisionReversalRate: number | null;
  humanCommitRatio: number | null;
  medianCorrectionCommitsAfterOpen: number | null;
  mergedWithoutHumanEditRatio: number | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `independentDeliveryRatio` | `number \| null` | Nouvelle | Part des sujets terminés sans reprise structurante ni substitution par un tiers. |
| `clarificationRequestQuality` | `number \| null` | Nouvelle | Score normalisé évaluant si les questions importantes sont posées avant qu'elles ne causent une reprise. |
| `escalationRelevanceRatio` | `number \| null` | Nouvelle | Part des escalades déclenchées assez tôt et auprès du bon interlocuteur. |
| `decisionReversalRate` | `number \| null` | Nouvelle | Part des décisions du développeur annulées pour insuffisance d'analyse ou de validation. |
| `humanCommitRatio` | `number \| null` | Existante : `intervention.humanCommitRatio` | Part des commits identifiés comme produits directement sans assistance IA. |
| `medianCorrectionCommitsAfterOpen` | `number \| null` | Existante : `intervention.medianCorrectionCommitsAfterOpen` | Nombre médian de commits correctifs ajoutés après l'ouverture d'une PR. |
| `mergedWithoutHumanEditRatio` | `number \| null` | Existante : `intervention.mergedWithoutHumanEditRatio` | Part des PR fusionnées sans modification humaine après leur ouverture. |

## Impact collectif

```typescript
interface CollectiveImpactProfile {
  reviewHelpfulnessScore: number | null;
  reviewResponseTimeHours: number | null;
  reviewRiskDetectionRate: number | null;
  knowledgeSharingFrequency: number | null;
  busFactorContribution: number | null;
  crossTeamDeliveryRatio: number | null;
  mentoringImpactScore: number | null;
  handoverSuccessRatio: number | null;
  teamThroughputImpact: number | null;
  codeOwnershipConcentration: number | null;
  documentationFreshnessRatio: number | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `reviewHelpfulnessScore` | `number \| null` | Nouvelle | Score normalisé de l'utilité des reviews selon les corrections ou risques réellement évités. |
| `reviewResponseTimeHours` | `number \| null` | Nouvelle | Durée médiane avant la première review utile demandée au développeur. |
| `reviewRiskDetectionRate` | `number \| null` | Nouvelle | Part des risques confirmés que le développeur identifie pendant les reviews des autres. |
| `knowledgeSharingFrequency` | `number \| null` | Nouvelle | Nombre normalisé de contenus ou sessions de partage réutilisés par l'équipe. |
| `busFactorContribution` | `number \| null` | Nouvelle | Évolution de la capacité de l'équipe à maintenir les zones auparavant détenues par une seule personne. |
| `crossTeamDeliveryRatio` | `number \| null` | Nouvelle | Part des sujets impliquant plusieurs équipes qui atteignent leur objectif partagé. |
| `mentoringImpactScore` | `number \| null` | Nouvelle | Score normalisé de progression observable des personnes accompagnées. |
| `handoverSuccessRatio` | `number \| null` | Nouvelle | Part des sujets transmis puis repris sans clarification ou reprise majeure. |
| `teamThroughputImpact` | `number \| null` | Nouvelle | Évolution du débit collectif associée aux contributions facilitatrices du développeur. |
| `codeOwnershipConcentration` | `number \| null` | Nouvelle | Part du périmètre modifié dont le développeur reste l'unique contributeur compétent. |
| `documentationFreshnessRatio` | `number \| null` | Partiellement existante : `harness.contextEngineering` | Part des changements nécessitant une documentation pour lesquels celle-ci reste cohérente après livraison. |

## Complexité maîtrisée

```typescript
interface ComplexityProfile {
  problemAmbiguityScore: number | null;
  domainComplexityScore: number | null;
  technicalComplexityScore: number | null;
  dependencyComplexityScore: number | null;
  successfulComplexWorkRatio: number | null;
  simplificationImpactScore: number | null;
  architectureDecisionQualityScore: number | null;
  sizeDistribution: SizeDistribution | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `problemAmbiguityScore` | `number \| null` | Nouvelle | Score normalisé du manque initial de clarté sur le besoin, la solution et les critères de réussite. |
| `domainComplexityScore` | `number \| null` | Nouvelle | Score normalisé de difficulté des règles métier manipulées. |
| `technicalComplexityScore` | `number \| null` | Nouvelle | Score normalisé des contraintes techniques, de performance, de sécurité et d'intégration. |
| `dependencyComplexityScore` | `number \| null` | Nouvelle | Score normalisé du nombre, de la criticité et de l'instabilité des dépendances. |
| `successfulComplexWorkRatio` | `number \| null` | Nouvelle | Part des sujets complexes terminés avec leurs critères métier, qualité et exploitation satisfaits. |
| `simplificationImpactScore` | `number \| null` | Nouvelle | Score normalisé de complexité durablement supprimée pour les futurs contributeurs. |
| `architectureDecisionQualityScore` | `number \| null` | Nouvelle | Score normalisé de décisions encore valides après observation de leurs conséquences. |
| `sizeDistribution` | `SizeDistribution \| null` | Existante : `size.distribution` | Distribution des tailles de PR utilisée comme contexte de complexité et jamais comme preuve autonome de niveau. |

## Efficacité de l'IA

```typescript
interface AiEffectivenessProfile {
  aiGeneratedChangeAcceptanceRatio: number | null;
  aiRelatedDefectRate: number | null;
  aiVerificationCoverageRatio: number | null;
  aiCostPerDeliveredOutcome: number | null;
  aiContextReuseRatio: number | null;
  parallelWorkCompletionRatio: number | null;
  aiCoauthoredRatio: number | null;
  medianConcurrentBranches: number | null;
  maxConcurrentBranches: number | null;
  hasWorktreeInclude: boolean | null;
}
```

| Champ | Type | Provenance | Explication |
|---|---|---|---|
| `aiGeneratedChangeAcceptanceRatio` | `number \| null` | Nouvelle | Part des changements produits avec l'IA et acceptés sans reprise significative. |
| `aiRelatedDefectRate` | `number \| null` | Nouvelle | Défauts attribués à une sortie IA rapportés au nombre de changements assistés par IA. |
| `aiVerificationCoverageRatio` | `number \| null` | Nouvelle | Part des changements assistés par IA accompagnés de validations automatisées pertinentes. |
| `aiCostPerDeliveredOutcome` | `number \| null` | Nouvelle | Coût total des usages IA rapporté au nombre de résultats métier effectivement obtenus. |
| `aiContextReuseRatio` | `number \| null` | Nouvelle | Part des sessions utilisant un contexte structuré déjà validé et maintenu. |
| `parallelWorkCompletionRatio` | `number \| null` | Nouvelle | Part des travaux commencés en parallèle qui aboutissent sans abandon ni reprise excessive. |
| `aiCoauthoredRatio` | `number \| null` | Existante : `harness.aiConfiguration.aiCoauthoredRatio` | Part des commits identifiés comme coécrits avec une IA. |
| `medianConcurrentBranches` | `number \| null` | Existante : `parallelism.medianConcurrentBranches` | Nombre médian de branches actives simultanément pendant la période. |
| `maxConcurrentBranches` | `number \| null` | Existante : `parallelism.maxConcurrentBranches` | Nombre maximal de branches actives simultanément pendant la période. |
| `hasWorktreeInclude` | `boolean \| null` | Existante : `parallelism.hasWorktreeInclude` | Indique si la configuration nécessaire au partage entre worktrees est présente. |

## Métriques dérivées

```typescript
interface DeliveryConfidenceDerivedMetrics {
  businessImpactScore: number | null;
  deliveryReliabilityScore: number | null;
  qualityAndRiskScore: number | null;
  autonomyScore: number | null;
  collectiveImpactScore: number | null;
  complexityMultiplier: number | null;
  aiEffectivenessScore: number | null;
  dataConfidenceScore: number;
  deliveryConfidenceScore: number | null;
}
```

| Champ | Type | Explication |
|---|---|---|
| `businessImpactScore` | `number \| null` | Score normalisé de valeur métier calculé uniquement avec les mesures disponibles. |
| `deliveryReliabilityScore` | `number \| null` | Score normalisé de prévisibilité et de continuité de livraison. |
| `qualityAndRiskScore` | `number \| null` | Score normalisé de qualité intégrant des pénalités fortes pour les conséquences graves. |
| `autonomyScore` | `number \| null` | Score normalisé de capacité à livrer sans reprise tout en escaladant correctement. |
| `collectiveImpactScore` | `number \| null` | Score normalisé de contribution à la capacité durable de l'équipe. |
| `complexityMultiplier` | `number \| null` | Coefficient borné qui contextualise les résultats selon la difficulté réellement confiée. |
| `aiEffectivenessScore` | `number \| null` | Score normalisé du bénéfice net de l'IA après prise en compte de la qualité et du coût. |
| `dataConfidenceScore` | `number` | Score de couverture, fraîcheur, diversité et fiabilité des données disponibles. |
| `deliveryConfidenceScore` | `number \| null` | Score transversal final calculé après pondérations, conditions obligatoires et contexte. |

## Readiness

```typescript
interface DeliveryConfidenceReadiness {
  calculable: boolean;
  reason: string | null;
  observedDays: number;
  requiredDays: number;
  availableRequiredFields: number;
  requiredFields: number;
  sourceDiversityCount: number;
}
```

| Champ | Type | Explication |
|---|---|---|
| `calculable` | `boolean` | Indique si les données minimales permettent d'attribuer un level défendable. |
| `reason` | `string \| null` | Explique pourquoi l'axe n'est pas calculable lorsque les prérequis échouent. |
| `observedDays` | `number` | Nombre de jours d'activité couverts par les données retenues. |
| `requiredDays` | `number` | Durée minimale configurée pour réduire l'effet des événements isolés. |
| `availableRequiredFields` | `number` | Nombre de champs obligatoires disposant d'une valeur exploitable. |
| `requiredFields` | `number` | Nombre total de champs obligatoires définis par la configuration. |
| `sourceDiversityCount` | `number` | Nombre de familles de sources indépendantes participant au résultat. |

## Résultat de l'axe

```typescript
interface DeliveryConfidenceResult {
  level: AiddLevelValue;
  score: number | null;
  readiness: DeliveryConfidenceReadiness;
  derivedMetrics: DeliveryConfidenceDerivedMetrics;
  blockingGates: DeliveryConfidenceGateResult[];
  impactingNulls: string[];
  ignoredNulls: string[];
}

interface DeliveryConfidenceGateResult {
  name: string;
  passed: boolean;
  value: number | boolean | null;
  expected: number | boolean;
}
```

| Champ | Type | Explication |
|---|---|---|
| `level` | `AiddLevelValue` | Level attribué après application du score, des conditions obligatoires et de la readiness. |
| `score` | `number \| null` | Score final exposé pour expliquer la position entre deux levels. |
| `readiness` | `DeliveryConfidenceReadiness` | État détaillé des prérequis nécessaires au calcul. |
| `derivedMetrics` | `DeliveryConfidenceDerivedMetrics` | Ensemble des scores intermédiaires utilisés pour expliquer le résultat. |
| `blockingGates` | `DeliveryConfidenceGateResult[]` | Conditions non compensables qui limitent le level malgré le score obtenu. |
| `impactingNulls` | `string[]` | Chemins des données absentes susceptibles de modifier le résultat. |
| `ignoredNulls` | `string[]` | Chemins des données absentes fournies uniquement comme contexte. |
| `blockingGates[].name` | `string` | Identifiant stable de la condition obligatoire évaluée. |
| `blockingGates[].passed` | `boolean` | Indique si la condition obligatoire est satisfaite. |
| `blockingGates[].value` | `number \| boolean \| null` | Valeur observée ayant servi à évaluer la condition. |
| `blockingGates[].expected` | `number \| boolean` | Valeur minimale, maximale ou booléenne exigée par la condition. |

## Configuration proposée

```typescript
interface DeliveryConfidenceConfig {
  weights: DeliveryConfidenceWeights;
  levels: DeliveryConfidenceLevelThresholds;
  gates: DeliveryConfidenceGatesConfig;
  readiness: DeliveryConfidenceReadinessConfig;
  complexityMultiplier: DeliveryConfidenceComplexityMultiplierConfig;
}

interface DeliveryConfidenceWeights {
  businessImpact: number;
  deliveryReliability: number;
  qualityAndRisk: number;
  autonomy: number;
  collectiveImpact: number;
  aiEffectiveness: number;
}

interface DeliveryConfidenceLevelThresholds {
  red: number;
  blue: number;
  green: number;
  copper: number;
  silver: number;
  gold: number;
}

interface DeliveryConfidenceGatesConfig {
  maxChangeFailureRateForSilver: number;
  maxChangeFailureRateForGold: number;
  maxSecurityIssueIntroductionRateForGold: number;
  minDataConfidenceScoreForGold: number;
}

interface DeliveryConfidenceReadinessConfig {
  requiredDays: number;
  minRequiredFieldRatio: number;
  minSourceDiversityCount: number;
}

interface DeliveryConfidenceComplexityMultiplierConfig {
  min: number;
  max: number;
}
```

| Champ | Type | Explication |
|---|---|---|
| `weights` | `DeliveryConfidenceWeights` | Contient la contribution relative de chaque signal au score transversal. |
| `levels` | `DeliveryConfidenceLevelThresholds` | Contient le score minimal nécessaire pour atteindre chaque level. |
| `gates` | `DeliveryConfidenceGatesConfig` | Contient les limites de qualité, de sécurité et de confiance non compensables. |
| `readiness` | `DeliveryConfidenceReadinessConfig` | Contient les prérequis minimaux de durée, de champs et de sources. |
| `complexityMultiplier` | `DeliveryConfidenceComplexityMultiplierConfig` | Contient les bornes empêchant la complexité de surcompenser un résultat insuffisant. |
| `weights.businessImpact` | `number` | Pondère la valeur métier dans le score final. |
| `weights.deliveryReliability` | `number` | Pondère la fiabilité de livraison dans le score final. |
| `weights.qualityAndRisk` | `number` | Pondère la qualité et la maîtrise du risque dans le score final. |
| `weights.autonomy` | `number` | Pondère l'autonomie dans le score final. |
| `weights.collectiveImpact` | `number` | Pondère l'impact collectif dans le score final. |
| `weights.aiEffectiveness` | `number` | Pondère l'efficacité nette de l'IA dans le score final. |
| `levels.red` | `number` | Définit le score minimal du level `red`. |
| `levels.blue` | `number` | Définit le score minimal du level `blue`. |
| `levels.green` | `number` | Définit le score minimal du level `green`. |
| `levels.copper` | `number` | Définit le score minimal du level `copper`. |
| `levels.silver` | `number` | Définit le score minimal du level `silver`. |
| `levels.gold` | `number` | Définit le score minimal du level `gold`. |
| `gates.maxChangeFailureRateForSilver` | `number` | Définit le taux maximal d'échec de changement compatible avec `silver`. |
| `gates.maxChangeFailureRateForGold` | `number` | Définit le taux maximal d'échec de changement compatible avec `gold`. |
| `gates.maxSecurityIssueIntroductionRateForGold` | `number` | Définit le taux maximal de problèmes de sécurité introduits compatible avec `gold`. |
| `gates.minDataConfidenceScoreForGold` | `number` | Définit la confiance minimale des données exigée pour attribuer `gold`. |
| `readiness.requiredDays` | `number` | Définit la durée minimale d'observation nécessaire au calcul. |
| `readiness.minRequiredFieldRatio` | `number` | Définit la proportion minimale de champs obligatoires disponibles. |
| `readiness.minSourceDiversityCount` | `number` | Définit le nombre minimal de familles de sources indépendantes. |
| `complexityMultiplier.min` | `number` | Borne la réduction maximale du score liée à un contexte peu complexe. |
| `complexityMultiplier.max` | `number` | Borne l'augmentation maximale du score liée à un contexte très complexe. |

## Sources fictives à prévoir

| Source | Contenu attendu | Explication |
|---|---|---|
| `product-outcomes.json` | Adoption, objectifs métier et valeur observée | Relie les livraisons techniques à leurs résultats produit mesurables. |
| `delivery-flow.json` | Engagements, dates, blocages et changements de périmètre | Reconstitue la fiabilité du flux depuis la prise en charge jusqu'à la livraison. |
| `deployments.json` | Déploiements, rollbacks, hotfixes et procédures de retour | Mesure les conséquences opérationnelles de chaque changement livré. |
| `incidents.json` | Incidents, causes, durée et contributions à la résolution | Mesure les risques introduits et la capacité à restaurer le service. |
| `security-findings.json` | Vulnérabilités introduites, détectées et corrigées | Mesure la maîtrise du risque de sécurité sur le périmètre évalué. |
| `work-items.json` | Complexité, dépendances, reprises et abandons | Contextualise les résultats selon la nature réelle des sujets confiés. |
| `reviews.json` | Délais, risques détectés et utilité des reviews | Mesure la contribution qualitative aux changements produits par l'équipe. |
| `knowledge-sharing.json` | Mentorat, documentation, sessions et réutilisation | Mesure la diffusion durable des connaissances et la réduction du bus factor. |
| `ai-usage.json` | Sessions, coûts, validations et défauts associés | Mesure le bénéfice net de l'IA plutôt que son simple volume d'utilisation. |
| `team-baseline.json` | Références comparables du rôle, de l'équipe et du produit | Permet une interprétation contextualisée sans classement brut entre développeurs. |

## Données explicitement exclues

| Donnée | Explication |
|---|---|
| Heures de connexion | La présence numérique ne démontre ni valeur, ni qualité, ni autonomie. |
| Frappes clavier ou mouvements de souris | La surveillance comportementale est intrusive et sans lien fiable avec le niveau. |
| Nombre brut de commits | Le découpage des commits varie selon les pratiques et se manipule facilement. |
| Nombre brut de lignes | Le volume de code peut récompenser la duplication et pénaliser la simplification. |
| Nombre brut de PR | La quantité de PR ne décrit ni leur difficulté ni leur résultat. |
| Classement individuel public | La comparaison hors contexte crée des incitations contraires à la collaboration. |
| Contenu privé des conversations | L'évaluation ne doit pas dépendre de communications personnelles ou non consenties. |

## Résumé du calcul envisagé

1. Vérifier `DeliveryConfidenceReadiness` avant tout calcul de level.
2. Normaliser chaque métrique dans son signal sans convertir les valeurs `null` en mauvaises performances.
3. Calculer les six scores de signal puis appliquer les pondérations configurées.
4. Appliquer un `complexityMultiplier` borné pour contextualiser les résultats observés.
5. Appliquer les conditions obligatoires de `qualityAndRisk` et de confiance des données.
6. Comparer `deliveryConfidenceScore` aux seuils descendants de `gold` à `red`.
7. Retourner le level avec les scores intermédiaires, les conditions bloquantes et les données manquantes.
