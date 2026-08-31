'use client';

import { useEffect, useState } from 'react';
import {
  createDefaultEvaluationConfig,
  mergeEvaluationConfig,
} from '../config/default-evaluation-config';
import type { EvaluationConfig } from '../types/evaluation-config';

const STORAGE_KEY = 'laivel-up:evaluator-config';

export function useEvaluatorConfig(): {
  config: EvaluationConfig;
  isReady: boolean;
  update: (next: Partial<EvaluationConfig>) => void;
  reset: () => void;
} {
  const [config, setConfig] = useState<EvaluationConfig>(createDefaultEvaluationConfig);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(mergeEvaluationConfig(JSON.parse(stored) as unknown));
      } catch {
        setConfig(createDefaultEvaluationConfig());
      }
    }
    setIsReady(true);
  }, []);

  function update(next: Partial<EvaluationConfig>) {
    setConfig((prev) => {
      const merged = { ...prev, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }

  function reset() {
    const initialConfig = createDefaultEvaluationConfig();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialConfig));
    setConfig(initialConfig);
  }

  return { config, isReady, update, reset };
}
