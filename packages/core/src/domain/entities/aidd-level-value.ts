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
