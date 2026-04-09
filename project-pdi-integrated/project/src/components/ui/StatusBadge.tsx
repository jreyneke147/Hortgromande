const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  planned: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  completed: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  archived: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  draft: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  submitted: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  validated: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  open: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  locked: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  output: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  outcome: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  impact: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  imported: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  mapped: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  validating: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'needs review': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'validation failed': 'bg-red-50 text-red-700 ring-red-600/20',
  'validation passed': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  published: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  passed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  failed: 'bg-red-50 text-red-700 ring-red-600/20',
  pending: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  in_transit: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export default function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status.toLowerCase()] ?? 'bg-gray-50 text-gray-600 ring-gray-500/20';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${color}`}>
      {status}
    </span>
  );
}
