import { BehaviorProfile } from './behavior-profile';
import { ContextEngineeringProfile } from './context-engineering-profile';
import { LoopsProfile } from './loops-profile';

export interface HarnessProfile {
  contextEngineering: ContextEngineeringProfile | null;
  behavior: BehaviorProfile | null;
  loops: LoopsProfile | null;
}
