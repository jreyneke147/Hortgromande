import type { IndicatorPillar } from '../types';

export const PILLARS: { key: IndicatorPillar; label: string; color: string; bgColor: string; ringColor: string }[] = [
  { key: 'economic', label: 'Economic', color: 'text-emerald-700', bgColor: 'bg-emerald-50', ringColor: 'ring-emerald-600/20' },
  { key: 'social', label: 'Social', color: 'text-sky-700', bgColor: 'bg-sky-50', ringColor: 'ring-sky-600/20' },
  { key: 'environmental', label: 'Environmental', color: 'text-teal-700', bgColor: 'bg-teal-50', ringColor: 'ring-teal-600/20' },
  { key: 'institutional', label: 'Institutional', color: 'text-amber-700', bgColor: 'bg-amber-50', ringColor: 'ring-amber-600/20' },
];

export const CATEGORIES: Record<IndicatorPillar, { key: string; label: string }[]> = {
  economic: [
    { key: 'production', label: 'Production' },
    { key: 'yield', label: 'Yield' },
    { key: 'turnover', label: 'Turnover' },
    { key: 'profitability', label: 'Profitability' },
    { key: 'exports', label: 'Exports' },
    { key: 'hectares_established', label: 'Hectares Established' },
    { key: 'financing', label: 'Financing Leveraged' },
    { key: 'investment', label: 'Investment' },
  ],
  social: [
    { key: 'permanent_jobs', label: 'Permanent Jobs' },
    { key: 'seasonal_jobs', label: 'Seasonal Jobs' },
    { key: 'gender_participation', label: 'Gender Participation' },
    { key: 'youth_participation', label: 'Youth Participation' },
    { key: 'training_hours', label: 'Training Hours' },
    { key: 'beneficiaries', label: 'Beneficiaries Supported' },
    { key: 'equity_participation', label: 'Equity Participation' },
    { key: 'training', label: 'Training' },
  ],
  environmental: [
    { key: 'water_use_efficiency', label: 'Water-Use Efficiency' },
    { key: 'sustainable_practices', label: 'Hectares Under Sustainable Practices' },
    { key: 'climate_smart', label: 'Climate-Smart Interventions' },
    { key: 'adaptation', label: 'Adaptation Metrics' },
  ],
  institutional: [
    { key: 'governance_maturity', label: 'Governance Maturity' },
    { key: 'management_quality', label: 'Management Quality' },
    { key: 'mentorship', label: 'Mentorship / Business Coaching' },
    { key: 'market_access', label: 'Market Access' },
    { key: 'ownership_structures', label: 'Ownership Structures' },
    { key: 'graduation_status', label: 'Graduation Status' },
  ],
};

export function getPillarConfig(pillar: IndicatorPillar) {
  return PILLARS.find(p => p.key === pillar) ?? PILLARS[0];
}

export function getCategoryLabel(pillar: IndicatorPillar, category: string): string {
  const cat = CATEGORIES[pillar]?.find(c => c.key === category);
  return cat?.label ?? category;
}
