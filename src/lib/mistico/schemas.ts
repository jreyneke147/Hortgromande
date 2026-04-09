import { z } from 'zod';

export const orchardImportSchema = z.object({
  source_sheet: z.string().min(1),
  source_row_number: z.number().int().positive(),
  fruit_type: z.string().min(1),
  plant_year: z.number().int().min(1950).max(2100),
  age: z.number().int().min(0).max(100),
  rootstock: z.string().min(1),
  block_number: z.string().min(1),
  variety: z.string().min(1),
  tree_count: z.number().int().nonnegative(),
  area_hectares: z.number().positive(),
  trees_per_hectare: z.number().int().positive(),
  plant_spacing_m: z.number().positive(),
  row_spacing_m: z.number().positive(),
  crates_2024: z.number().nonnegative(),
  ton_ha_2024: z.number().nonnegative(),
  crates_2025: z.number().nonnegative(),
  ton_ha_2025: z.number().nonnegative(),
  crates_2026: z.number().nonnegative(),
  ton_ha_2026: z.number().nonnegative(),
});

export const revenueImportSchema = z.object({
  source_sheet: z.string().min(1),
  source_row_number: z.number().int().positive(),
  commodity_code: z.enum(['AP', 'PR']),
  market_channel: z.enum(['EXPORT', 'LOCAL', 'ALL', 'HAWKERS', 'OTHER']),
  market_label: z.string().min(1),
  amount: z.number(),
});

export type OrchardImportSchema = z.infer<typeof orchardImportSchema>;
export type RevenueImportSchema = z.infer<typeof revenueImportSchema>;
