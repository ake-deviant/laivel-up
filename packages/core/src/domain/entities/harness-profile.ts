import { AiConfigurationProfile } from './ai-configuration-profile';
import { ContextEngineeringProfile } from './context-engineering-profile';
import { LoopsProfile } from './loops-profile';

export interface HarnessProfile {
  contextEngineering: ContextEngineeringProfile | null;
  aiConfiguration: AiConfigurationProfile | null;
  loops: LoopsProfile | null;
}
