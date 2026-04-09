export const TON_PER_CRATE = 0.0185;

export function calculateYoYChange(newValue: number, oldValue: number): number | null {
  if (oldValue === 0) return null;
  return (newValue - oldValue) / oldValue;
}

export function calculateTonPerHectare(crates: number, areaHectares: number, tonPerCrate = TON_PER_CRATE): number {
  if (areaHectares <= 0) return 0;
  return Number(((crates * tonPerCrate) / areaHectares).toFixed(2));
}

export function classifyGrowth(changeRatio: number | null): 'strong_positive' | 'moderate' | 'significant_decline' | 'unknown' {
  if (changeRatio == null) return 'unknown';
  if (changeRatio >= 0.2) return 'strong_positive';
  if (changeRatio <= -0.15) return 'significant_decline';
  return 'moderate';
}
