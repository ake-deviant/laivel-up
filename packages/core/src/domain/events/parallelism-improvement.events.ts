import { LevelImprovementEvent } from '../ports/level-improvement-bus.port';

export const WORKTREE_DATA_MISSING = 'worktree_data_missing' as const;
export const WORKTREE_NOT_CONFIGURED = 'worktree_not_configured' as const;

export interface WorktreeDataMissingEvent extends LevelImprovementEvent {
  axis: 'parallelism';
  type: typeof WORKTREE_DATA_MISSING;
}

export interface WorktreeNotConfiguredEvent extends LevelImprovementEvent {
  axis: 'parallelism';
  type: typeof WORKTREE_NOT_CONFIGURED;
}
