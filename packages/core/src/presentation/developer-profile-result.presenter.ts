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
          'CLAUDE.md présent',
          "Fichier principal d'instructions projet fourni à l'IA à chaque session",
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
          'AGENTS.md présent',
          'Fichier de configuration des agents IA opérant sur ce repo',
          configuration?.agentsMd ?? null,
        ),
        field(
          'settingsJson',
          'settings.json présent',
          "Fichier de paramétrage de l'outil IA au niveau projet (ex : Claude Code)",
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
        '.worktreeinclude présent',
        'Fichier Git permettant de partager la config IA entre plusieurs worktrees actifs',
        profile.hasWorktreeInclude,
      ),
    ],
  },
];

export class DeveloperProfileResultPresenter {
  static present(result: DeveloperProfileResult): DeveloperProfileResultViewModel {
    const matrixByAxis = new Map(result.signalMatrices.map((m) => [m.axis, m]));

    const axes: AxisViewModel[] = [
      {
        axis: 'size',
        label: AXIS_LABEL.size,
        level: toLevel(result.sizeLevel),
        signals: toSignals(matrixByAxis.get('size')),
        fieldGroups: toSizeFieldGroups(result.axisProfiles.size),
      },
      {
        axis: 'harness',
        label: AXIS_LABEL.harness,
        level: toLevel(result.harnessLevel),
        signals: toSignals(matrixByAxis.get('harness')),
        fieldGroups: toHarnessFieldGroups(result.axisProfiles.harness),
      },
      {
        axis: 'intervention',
        label: AXIS_LABEL.intervention,
        level: toLevel(result.interventionLevel),
        signals: toSignals(matrixByAxis.get('intervention')),
        fieldGroups: toInterventionFieldGroups(result.axisProfiles.intervention),
      },
      {
        axis: 'parallelism',
        label: AXIS_LABEL.parallelism,
        level: toLevel(result.parallelismLevel),
        signals: toSignals(matrixByAxis.get('parallelism')),
        fieldGroups: toParallelismFieldGroups(result.axisProfiles.parallelism),
      },
    ];

    const improvements: ImprovementViewModel[] = result.improvements.map((imp) => ({
      axis: imp.axis,
      type: imp.type,
      targetLevel: imp.targetLevel,
    }));

    const busImprovements: ImprovementViewModel[] = result.busImprovements.map((imp) => ({
      axis: imp.axis,
      type: imp.type,
      targetLevel: imp.targetLevel,
    }));

    return {
      overallLevel: toLevel(result.overallLevel),
      axes,
      improvements,
      busImprovements,
    };
  }
}
