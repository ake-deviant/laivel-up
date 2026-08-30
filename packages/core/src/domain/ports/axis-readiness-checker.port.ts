export interface AxisReadiness {
  calculable: boolean;
  missingEssential: string[];
  missingImpacting: string[];
}

export interface IAxisReadinessChecker<TProfile> {
  check(profile: TProfile): AxisReadiness;
}
