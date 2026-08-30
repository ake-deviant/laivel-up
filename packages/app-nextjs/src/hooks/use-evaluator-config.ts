'use client';

import { useEffect, useState } from 'react';
import type { EvaluationConfig } from '../types/evaluation-config';

const STORAGE_KEY = 'laivel-up:evaluator-config';

const DEFAULT: EvaluationConfig = {
  nonBlockingAxes: ['velocity'],
  parallelismWeights: { median: 5, max: 1 },
  harnessContextWeights: {
    claudeMd: 4,
    docsContextCount: 2,
    docsSpecsCount: 3,
    docsBrainstormCount: 2,
    docsPlansCount: 3,
    memoryCount: 4,
    tasksCount: 3,
  },
  harnessAiWeights: {
    agentsMd: 3,
    settingsJson: 2,
    agentsCount: 3,
    skillsCount: 3,
    hooksCount: 4,
    rulesCount: 4,
  },
};

export function useEvaluatorConfig() {
  const [config, setConfig] = useState<EvaluationConfig>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig({ ...DEFAULT, ...(JSON.parse(stored) as Partial<EvaluationConfig>) });
      } catch {
        setConfig(DEFAULT);
      }
    }
  }, []);

  function update(next: Partial<EvaluationConfig>) {
    const merged = { ...config, ...next };
    setConfig(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return { config, update };
}
