import { DeveloperProfileResult } from '../domain/entities/developer-profile-result';
import { AiddLevelValue } from '../domain/entities/aidd-level-value';
import { ImprovementAxis } from '../domain/entities/improvement';
import { AxisSignalMatrix } from '../domain/entities/axis-signal-matrix';
import {
  DeveloperProfileResultViewModel,
  LevelViewModel,
  AxisViewModel,
  ImprovementViewModel,
  SignalViewModel,
  AxisFieldGroupViewModel,
  MissingDataAxisViewModel,
  MissingDataFieldViewModel,
  MissingDataGroupViewModel,
  ImprovementOpportunityViewModel,
} from './developer-profile-result.view-model';

const LEVEL_LABEL: Record<AiddLevelValue, string> = {
  white: 'White',
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  copper: 'Copper',
  silver: 'Silver',
  gold: 'Gold',
};

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

const AXIS_LABEL: Record<ImprovementAxis, string> = {
  size: 'Taille',
  harness: 'Harness',
  intervention: 'Intervention',
  parallelism: 'Parallèle',
  velocity: 'Vélocité',
};

const toLevel = (value: AiddLevelValue): LevelViewModel => ({
  value,
  label: LEVEL_LABEL[value],
  rank: LEVEL_RANK[value],
});

const SIGNAL_LABEL: Record<string, string> = {
  xl: 'PRs XL',
  lXl: 'PRs L+XL',
  s: 'PRs S',
  m: 'PRs M',
  l: 'PRs L',
  medianConcurrentBranches: 'Branches parallèles (médiane)',
  maxConcurrentBranches: 'Branches simultanées (max)',
  hasWorktreeInclude: '.worktreeinclude',
  contextEngineeringScore: 'Score contexte',
  aiConfigurationScore: 'Score configuration IA',
  ciMedianRunsToGreen: 'CI médiane runs',
  medianCorrectionCommitsAfterOpen: 'Commits de correction',
  humanCommitRatio: 'Commits humains',
  mergedWithoutHumanEditRatio: 'Sans édition humaine',
  medianReviewCommentsReceived: 'Commentaires de review',
  leverageRatio: 'Levier vélocité',
  completionRate: 'Taux de complétion',
  cycleTimeRatio: 'Ratio cycle time',
  featureRatio: 'Ratio features',
};

const toSignals = (matrix: AxisSignalMatrix | undefined): SignalViewModel[] => {
  if (!matrix) return [];
  return matrix.signals.map((s) => ({
    name: s.name,
    label: SIGNAL_LABEL[s.name] ?? s.name,
    validated: s.validated,
    value: s.value,
  }));
};

const IMPROVEMENT_PRESENTATION: Record<string, { label: string; description: string }> = {
  hasWorktreeInclude: {
    label: 'Configurer les worktrees Git',
    description: 'Partager la configuration IA entre plusieurs worktrees actifs.',
  },
  worktree_data_missing: {
    label: 'Renseigner les données liées aux worktrees Git',
    description: 'Collecter les informations nécessaires pour évaluer le travail en parallèle.',
  },
  worktree_not_configured: {
    label: 'Configurer les worktrees Git',
    description:
      'Mettre en place les worktrees nécessaires pour progresser vers le niveau suivant.',
  },
  medianConcurrentBranches: {
    label: 'Développer le travail en parallèle',
    description:
      "Augmenter le nombre médian de branches ouvertes simultanément, reflet de l'habitude réelle sans être faussé par un pic isolé.",
  },
  maxConcurrentBranches: {
    label: 'Augmenter la capacité de travail simultané',
    description: 'Faire progresser le nombre maximal de branches actives en même temps.',
  },
  xl: {
    label: 'Augmenter la part des réalisations XL',
    description: 'Développer la capacité à livrer des changements de plus de 500 lignes.',
  },
  lXl: {
    label: 'Augmenter la part des réalisations L ou XL',
    description: 'Développer la capacité à livrer des changements larges ou multi-modules.',
  },
  s: {
    label: 'Consolider les réalisations S',
    description: 'Renforcer la livraison de petites fonctionnalités bien délimitées.',
  },
  m: {
    label: 'Consolider les réalisations M',
    description: 'Renforcer la livraison de changements de complexité standard.',
  },
  l: {
    label: 'Consolider les réalisations L',
    description: 'Renforcer la livraison de fonctionnalités en plusieurs étapes.',
  },
  contextEngineeringScore: {
    label: 'Renforcer le contexte fourni à l’IA',
    description:
      'Améliorer les informations et instructions disponibles pour guider les agents IA.',
  },
  aiConfigurationScore: {
    label: 'Enrichir la configuration des agents IA',
    description: 'Compléter la configuration utilisée par les outils et agents IA.',
  },
  ciMedianRunsToGreen: {
    label: 'Réduire les relances de CI',
    description: 'Diminuer le nombre médian de runs nécessaires avant d’obtenir une CI verte.',
  },
  medianCorrectionCommitsAfterOpen: {
    label: 'Réduire les corrections après ouverture',
    description:
      'Diminuer le nombre médian de commits correctifs ajoutés après l’ouverture des PRs.',
  },
  humanCommitRatio: {
    label: 'Augmenter la part de travail produite avec l’IA',
    description: 'Réduire la proportion de commits écrits directement sans assistance IA.',
  },
  mergedWithoutHumanEditRatio: {
    label: 'Augmenter les PRs fusionnées sans retouche',
    description:
      'Augmenter la part des PRs acceptées sans modification humaine après leur ouverture.',
  },
  medianReviewCommentsReceived: {
    label: 'Réduire les retours de review',
    description: 'Diminuer le nombre médian de commentaires reçus pendant la revue des PRs.',
  },
  leverageRatio: {
    label: 'Augmenter la cadence de livraison',
    description:
      "Livrer plus de story points par sprint relativement à la moyenne équipe — signal principal de l'axe vélocité.",
  },
  completionRate: {
    label: 'Améliorer le taux de complétion des sprints',
    description:
      'Terminer une plus grande part des tickets engagés dans le sprint — reflet de la fiabilité de livraison.',
  },
  cycleTimeRatio: {
    label: 'Réduire le cycle time',
    description:
      "Diminuer le délai médian entre la création d'un ticket et l'ouverture de la PR, pour passer sous la médiane équipe.",
  },
  featureRatio: {
    label: 'Orienter davantage le travail vers les features',
    description:
      'Augmenter la part des livraisons orientées valeur (features) par rapport aux corrections de bugs.',
  },
};

const toImprovement = (improvement: DeveloperProfileResult['improvements'][number]) => {
  const presentation = IMPROVEMENT_PRESENTATION[improvement.type];
  return {
    axis: improvement.axis,
    type: improvement.type,
    label: presentation?.label ?? improvement.type,
    description:
      presentation?.description ?? 'Signal à améliorer pour atteindre le niveau suivant.',
    targetLevel: improvement.targetLevel,
  };
};

const field = (
  name: string,
  label: string,
  description: string,
  value: number | boolean | null,
) => ({ name, label, description, value });

const toSizeFieldGroups = (
  profile: DeveloperProfileResult['axisProfiles']['size'],
): AxisFieldGroupViewModel[] => [
  {
    name: 'distribution',
    label: 'Distribution',
    fields: [
      field(
        'xs',
        'PRs XS (ratio)',
        'Part des PRs de moins de 10 lignes — correctifs ponctuels ou ajustements triviaux',
        profile.distribution?.xs ?? null,
      ),
      field(
        's',
        'PRs S (ratio)',
        'Part des PRs de 10 à 50 lignes — petites features bien délimitées',
        profile.distribution?.s ?? null,
      ),
      field(
        'm',
        'PRs M (ratio)',
        'Part des PRs de 50 à 200 lignes — complexité standard',
        profile.distribution?.m ?? null,
      ),
      field(
        'l',
        'PRs L (ratio)',
        'Part des PRs de 200 à 500 lignes — features multi-étapes',
        profile.distribution?.l ?? null,
      ),
      field(
        'xl',
        'PRs XL (ratio)',
        'Part des PRs de plus de 500 lignes — features multi-modules ou refactorings larges',
        profile.distribution?.xl ?? null,
      ),
    ],
  },
  {
    name: 'rawMetrics',
    label: 'Métriques brutes',
    fields: [
      field(
        'medianFilesChanged',
        'Fichiers modifiés (médiane)',
        'Nombre médian de fichiers touchés par PR — indique la surface de changement habituelle',
        profile.medianFilesChanged,
      ),
      field(
        'medianLinesChanged',
        'Lignes modifiées (médiane)',
        'Nombre médian de lignes changées par PR (ajouts + suppressions)',
        profile.medianLinesChanged,
      ),
    ],
  },
];

const toHarnessFieldGroups = (
  profile: DeveloperProfileResult['axisProfiles']['harness'],
): AxisFieldGroupViewModel[] => {
  const context = profile.contextEngineering;
  const configuration = profile.aiConfiguration;
  return [
    {
      name: 'contextEngineering',
      label: 'Context Engineering',
      fields: [
        field(
          'claudeMd',
          'Fichier CLAUDE.md',
          "Présence du fichier principal d'instructions projet fourni à l'IA à chaque session",
          context?.claudeMd ?? null,
        ),
        field(
          'docsContextCount',
          'Fichiers de contexte',
          "Fichiers décrivant l'architecture ou le domaine métier, lus par l'IA",
          context?.docsContextCount ?? null,
        ),
        field(
          'docsSpecsCount',
          'Spécifications',
          "Fichiers de specs fonctionnelles rédigés avant le code pour guider l'IA",
          context?.docsSpecsCount ?? null,
        ),
        field(
          'docsBrainstormCount',
          'Brainstorms',
          "Sessions d'exploration de solutions documentées et accessibles à l'IA",
          context?.docsBrainstormCount ?? null,
        ),
        field(
          'docsPlansCount',
          'Plans',
          "Plans d'implémentation étape par étape générés ou validés avec l'IA",
          context?.docsPlansCount ?? null,
        ),
        field(
          'memoryCount',
          'Fichiers mémoire',
          "Fichiers de mémoire persistante — l'IA retient des infos entre sessions",
          context?.memoryCount ?? null,
        ),
        field(
          'tasksCount',
          'Fichiers de tâches',
          "Listes de tâches structurées permettant à l'IA de reprendre le travail en cours",
          context?.tasksCount ?? null,
        ),
      ],
    },
    {
      name: 'aiConfiguration',
      label: 'Configuration IA',
      fields: [
        field(
          'agentsMd',
          'Fichier AGENTS.md',
          'Présence du fichier de configuration des agents IA opérant sur ce repo',
          configuration?.agentsMd ?? null,
        ),
        field(
          'settingsJson',
          'Configuration settings.json',
          "Présence du fichier de paramétrage de l'outil IA au niveau projet (ex : Claude Code)",
          configuration?.settingsJson ?? null,
        ),
        field(
          'agentsCount',
          'Agents configurés',
          "Nombre de sous-agents spécialisés que l'IA principale peut déléguer",
          configuration?.agentsCount ?? null,
        ),
        field(
          'skillsCount',
          'Skills configurés',
          'Nombre de commandes slash personnalisées déclarées pour ce projet',
          configuration?.skillsCount ?? null,
        ),
        field(
          'hooksCount',
          'Hooks configurés',
          "Scripts qui s'exécutent automatiquement avant ou après une action de l'IA",
          configuration?.hooksCount ?? null,
        ),
        field(
          'rulesCount',
          'Rules configurées',
          'Fichiers de règles de comportement injectés dans chaque session IA',
          configuration?.rulesCount ?? null,
        ),
        field(
          'aiCoauthoredRatio',
          'Commits co-authored IA',
          "Part des commits signés conjointement avec l'IA sur la période analysée",
          configuration?.aiCoauthoredRatio ?? null,
        ),
      ],
    },
    {
      name: 'loops',
      label: 'Boucles',
      fields: [
        field(
          'ciMedianRunsToGreen',
          'Médiane runs CI',
          "Nombre de tentatives CI avant qu'un pipeline passe au vert — 1 = premier coup",
          profile.loops?.ciMedianRunsToGreen ?? null,
        ),
      ],
    },
  ];
};

const toInterventionFieldGroups = (
  profile: DeveloperProfileResult['axisProfiles']['intervention'],
): AxisFieldGroupViewModel[] => [
  {
    name: 'intervention',
    label: 'Intervention',
    fields: [
      field(
        'totalPrCount',
        'Nombre total de PRs',
        'Nombre de pull requests analysées sur la période',
        profile.totalPrCount,
      ),
      field(
        'medianCorrectionCommitsAfterOpen',
        'Commits de correction (médiane)',
        'Commits ajoutés après ouverture de la PR pour corriger des erreurs — 0 = livraison propre',
        profile.medianCorrectionCommitsAfterOpen,
      ),
      field(
        'mergedWithoutHumanEditCount',
        'PRs sans retouche (nombre)',
        'Nombre de PRs mergées sans aucune modification humaine après ouverture',
        profile.mergedWithoutHumanEditCount,
      ),
      field(
        'mergedWithoutHumanEditRatio',
        'PRs sans retouche (ratio)',
        'Part des PRs acceptées telles quelles — 1.0 = jamais retouchées par un humain',
        profile.mergedWithoutHumanEditRatio,
      ),
      field(
        'medianReviewCommentsReceived',
        'Commentaires de review (médiane)',
        'Nombre médian de retours reçus par PR — 0 = code accepté sans discussion',
        profile.medianReviewCommentsReceived,
      ),
      field(
        'humanCommitRatio',
        'Ratio commits humains',
        "Part des commits écrits directement par un humain sans l'IA — 0.0 = tout produit par l'IA",
        profile.humanCommitRatio,
      ),
    ],
  },
];

const toParallelismFieldGroups = (
  profile: DeveloperProfileResult['axisProfiles']['parallelism'],
): AxisFieldGroupViewModel[] => [
  {
    name: 'parallelism',
    label: 'Parallelism',
    fields: [
      field(
        'medianConcurrentBranches',
        'Branches parallèles (médiane)',
        "Nombre médian de branches ouvertes simultanément — reflète l'habitude réelle",
        profile.medianConcurrentBranches,
      ),
      field(
        'maxConcurrentBranches',
        'Branches simultanées (max)',
        'Pic de branches actives en même temps — capacité maximale atteinte sur la période',
        profile.maxConcurrentBranches,
      ),
      field(
        'hasWorktreeInclude',
        'Fichier .worktreeinclude',
        'Présence du fichier Git permettant de partager la config IA entre plusieurs worktrees actifs',
        profile.hasWorktreeInclude,
      ),
    ],
  },
];

const toVelocityFieldGroups = (
  profile: DeveloperProfileResult['axisProfiles']['velocity'],
): AxisFieldGroupViewModel[] => [
  {
    name: 'throughput',
    label: 'Cadence',
    fields: [
      field(
        'sprintCount',
        'Nombre de sprints',
        'Nombre de sprints analysés — fenêtre de calcul de la vélocité',
        profile.sprintCount,
      ),
      field(
        'storyPointsPerSprint',
        'Story points par sprint',
        'Nombre moyen de points livrés par le développeur par sprint sur la période',
        profile.storyPointsPerSprint,
      ),
      field(
        'teamAvgStoryPointsPerSprint',
        'Moyenne équipe (story points)',
        'Référence équipe — utilisée pour calculer le ratio de levier',
        profile.teamAvgStoryPointsPerSprint,
      ),
      field(
        'completionRate',
        'Taux de complétion',
        'Part des tickets commencés et terminés dans le sprint — 1.0 = tout livré dans le sprint engagé',
        profile.completionRate,
      ),
    ],
  },
  {
    name: 'cycleTime',
    label: 'Cycle time',
    fields: [
      field(
        'medianDaysTicketToPr',
        'Jours ticket → PR (médiane)',
        "Délai médian entre la création d'un ticket et l'ouverture de la PR associée",
        profile.medianDaysTicketToPr,
      ),
      field(
        'teamAvgMedianDaysTicketToPr',
        'Référence équipe (cycle time)',
        'Délai médian équipe — utilisé pour calculer le ratio de cycle time',
        profile.teamAvgMedianDaysTicketToPr,
      ),
    ],
  },
  {
    name: 'scope',
    label: 'Périmètre',
    fields: [
      field(
        'featuresPerSprint',
        'Features par sprint',
        'Nombre moyen de features livrées par sprint sur la période',
        profile.featuresPerSprint,
      ),
      field(
        'bugsPerSprint',
        'Bugs par sprint',
        'Nombre moyen de corrections de bugs livrées par sprint — indicateur de la dette réactive',
        profile.bugsPerSprint,
      ),
    ],
  },
];

interface MissingDataCatalogEntry {
  axis: MissingDataAxisViewModel;
  field: MissingDataFieldViewModel;
}

const PROFILE_MISSING_DATA: Record<string, MissingDataFieldViewModel> = {
  'profile.role': {
    path: 'profile.role',
    label: 'Rôle',
    description: 'Rôle du développeur non renseigné.',
  },
  'profile.experienceYears': {
    path: 'profile.experienceYears',
    label: 'Expérience',
    description: "Nombre d'années d'expérience non renseigné.",
  },
  'profile.stack': {
    path: 'profile.stack',
    label: 'Stack technique',
    description: 'Technologies utilisées non renseignées.',
  },
  'profile.teamSize': {
    path: 'profile.teamSize',
    label: "Taille de l'équipe",
    description: "Nombre de personnes dans l'équipe non renseigné.",
  },
  'profile.note': {
    path: 'profile.note',
    label: 'Note de contexte',
    description: 'Aucune information complémentaire fournie.',
  },
};

const toFieldPath = (axis: AxisViewModel, groupName: string, fieldName: string): string => {
  if (axis.axis === 'harness') return `${axis.axis}.${groupName}.${fieldName}`;
  if (axis.axis === 'size' && groupName === 'distribution') {
    return `${axis.axis}.${groupName}.${fieldName}`;
  }
  return `${axis.axis}.${fieldName}`;
};

const toMissingDataGroups = (
  result: DeveloperProfileResult,
  axes: AxisViewModel[],
): MissingDataGroupViewModel[] => {
  const catalog = new Map<string, MissingDataCatalogEntry>();

  for (const [path, fieldViewModel] of Object.entries(PROFILE_MISSING_DATA)) {
    catalog.set(path, { axis: 'profile', field: fieldViewModel });
  }

  for (const axis of axes) {
    for (const group of axis.fieldGroups) {
      for (const axisField of group.fields) {
        const path = toFieldPath(axis, group.name, axisField.name);
        catalog.set(path, {
          axis: axis.axis,
          field: {
            path,
            label: axisField.label,
            description: axisField.description,
          },
        });
      }
    }
  }

  const axisOrder: MissingDataAxisViewModel[] = [
    'profile',
    'size',
    'harness',
    'intervention',
    'parallelism',
    'velocity',
  ];
  const groupLabel: Record<MissingDataAxisViewModel, string> = {
    profile: 'Profil',
    ...AXIS_LABEL,
  };

  return axisOrder.flatMap((axis) => {
    const impactingFields = result.impactingNulls
      .map((path) => catalog.get(path))
      .filter((entry): entry is MissingDataCatalogEntry => entry?.axis === axis)
      .map((entry) => entry.field);
    const ignoredFields = result.ignoredNulls
      .map((path) => catalog.get(path))
      .filter((entry): entry is MissingDataCatalogEntry => entry?.axis === axis)
      .map((entry) => entry.field);

    return impactingFields.length > 0 || ignoredFields.length > 0
      ? [{ axis, label: groupLabel[axis], impactingFields, ignoredFields }]
      : [];
  });
};

export class DeveloperProfileResultPresenter {
  static present(result: DeveloperProfileResult): DeveloperProfileResultViewModel {
    const matrixByAxis = new Map(result.signalMatrices.map((m) => [m.axis, m]));

    const axes: AxisViewModel[] = [
      {
        axis: 'size',
        label: AXIS_LABEL.size,
        level: toLevel(result.sizeLevel),
        calculable: true,
        signals: toSignals(matrixByAxis.get('size')),
        fieldGroups: toSizeFieldGroups(result.axisProfiles.size),
      },
      {
        axis: 'harness',
        label: AXIS_LABEL.harness,
        level: toLevel(result.harnessLevel),
        calculable: true,
        signals: toSignals(matrixByAxis.get('harness')),
        fieldGroups: toHarnessFieldGroups(result.axisProfiles.harness),
      },
      {
        axis: 'intervention',
        label: AXIS_LABEL.intervention,
        level: toLevel(result.interventionLevel),
        calculable: true,
        signals: toSignals(matrixByAxis.get('intervention')),
        fieldGroups: toInterventionFieldGroups(result.axisProfiles.intervention),
      },
      {
        axis: 'parallelism',
        label: AXIS_LABEL.parallelism,
        level: toLevel(result.parallelismLevel),
        calculable: true,
        signals: toSignals(matrixByAxis.get('parallelism')),
        fieldGroups: toParallelismFieldGroups(result.axisProfiles.parallelism),
      },
      {
        axis: 'velocity',
        label: AXIS_LABEL.velocity,
        level: toLevel(result.velocityLevel),
        calculable: result.velocityReadiness.calculable,
        signals: toSignals(matrixByAxis.get('velocity')),
        fieldGroups: toVelocityFieldGroups(result.axisProfiles.velocity),
      },
    ];

    const improvements: ImprovementViewModel[] = result.improvements.map(toImprovement);

    const busImprovements: ImprovementViewModel[] = result.busImprovements.map(toImprovement);

    return {
      overallLevel: toLevel(result.overallLevel),
      axes,
      improvements,
      busImprovements,
      formatWarnings: result.formatWarnings.map((warning) => ({
        field: warning.field,
        reason: warning.reason,
      })),
      missingDataGroups: toMissingDataGroups(result, axes),
      improvementOpportunities: (result.improvementOpportunities ?? []).map(
        (opportunity): ImprovementOpportunityViewModel => ({
          axis: opportunity.axis,
          field: opportunity.field,
          currentLevel: toLevel(opportunity.currentLevel),
          resultingLevel: toLevel(opportunity.resultingLevel),
          levelGain: opportunity.levelGain,
          scoreDelta: opportunity.scoreDelta,
          effort: opportunity.effort,
          fieldsToChange: opportunity.fieldsToChange,
          overallResultingLevel: toLevel(opportunity.overallResultingLevel),
          overallLevelGain: opportunity.overallLevelGain,
        }),
      ),
    };
  }
}
