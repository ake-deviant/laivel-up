export const DataSource = {
  gitActivity: 'gitActivity',
  pullRequests: 'pullRequests',
  sonar: 'sonar',
  repoContext: 'repoContext',
  sprintMetrics: 'sprintMetrics',
  declarative: 'declarative',
  session: 'session',
  code: 'code',
} as const;

export type DataSource = (typeof DataSource)[keyof typeof DataSource];
