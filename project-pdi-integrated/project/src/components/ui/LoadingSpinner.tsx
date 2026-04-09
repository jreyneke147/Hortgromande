import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
    </div>
  );
}
