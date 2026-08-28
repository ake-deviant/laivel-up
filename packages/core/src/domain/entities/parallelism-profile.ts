export interface ParallelismProfile {
  maxConcurrentBranches: number | null;
  medianConcurrentBranches: number | null;
  hasWorktreeInclude: boolean | null;
}
