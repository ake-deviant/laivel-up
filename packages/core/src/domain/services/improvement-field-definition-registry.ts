import { HarnessProfile } from '../entities/harness-profile';

export interface ImprovementFieldDefinition {
  axis: 'harness';
  field: string;
  impactScore: number;
  effort: 'low' | 'medium' | 'high';
  isEligible: (harness: HarnessProfile) => boolean;
  simulate: (harness: HarnessProfile) => HarnessProfile;
}

export class ImprovementFieldDefinitionRegistry {
  getAll(): ImprovementFieldDefinition[] {
    return [
      this.count('claudeMd', 4, (context) => ({ ...context, claudeMd: 1 })),
      this.count('docsContextCount', 2, (context) => ({
        ...context,
        docsContextCount: (context.docsContextCount ?? 0) + 1,
      })),
      this.count('docsSpecsCount', 3, (context) => ({
        ...context,
        docsSpecsCount: (context.docsSpecsCount ?? 0) + 1,
      })),
      this.count('docsBrainstormCount', 2, (context) => ({
        ...context,
        docsBrainstormCount: (context.docsBrainstormCount ?? 0) + 1,
      })),
      this.count('docsPlansCount', 3, (context) => ({
        ...context,
        docsPlansCount: (context.docsPlansCount ?? 0) + 1,
      })),
      this.count('memoryCount', 4, (context) => ({
        ...context,
        memoryCount: (context.memoryCount ?? 0) + 1,
      })),
      this.count('tasksCount', 3, (context) => ({
        ...context,
        tasksCount: (context.tasksCount ?? 0) + 1,
      })),
    ];
  }

  private count(
    field: string,
    impactScore: number,
    update: (
      context: NonNullable<HarnessProfile['contextEngineering']>,
    ) => NonNullable<HarnessProfile['contextEngineering']>,
  ): ImprovementFieldDefinition {
    return {
      axis: 'harness',
      field,
      impactScore,
      effort: 'low',
      isEligible: (harness) => {
        const context = harness.contextEngineering;
        if (!context) return false;
        return ((context[field as keyof typeof context] as number | null) ?? 0) < 1;
      },
      simulate: (harness) => ({
        ...harness,
        contextEngineering: update(harness.contextEngineering!),
      }),
    };
  }
}
