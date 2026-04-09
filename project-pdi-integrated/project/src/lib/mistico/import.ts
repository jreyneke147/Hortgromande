import { supabase } from '../supabase';
import type { DataQualityIssue } from '../../types/mistico';
export { parseOrchardCsv, parseRevenueRows } from './parser';

export async function saveDataQualityIssues(issues: DataQualityIssue[]) {
  if (issues.length === 0) return;
  await supabase.from('mistico_data_quality_issues').insert(issues.map(issue => ({
    ...issue,
    detected_at: new Date().toISOString(),
  })));
}
