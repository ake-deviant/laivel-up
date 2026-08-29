export const AiddLevelValue = {
  white: 'white',
  red: 'red',
  blue: 'blue',
  green: 'green',
  copper: 'copper',
  silver: 'silver',
  gold: 'gold',
} as const;

export type AiddLevelValue = (typeof AiddLevelValue)[keyof typeof AiddLevelValue];

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

export function lowestLevel(...levels: AiddLevelValue[]): AiddLevelValue {
  return levels.reduce((a, b) => (LEVEL_RANK[a] <= LEVEL_RANK[b] ? a : b));
}
