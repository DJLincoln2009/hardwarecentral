import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  id: string;
  message?: string;
  className?: string;
}

/** Message d'erreur de champ — lié au contrôle via aria-describedby. */
export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn('flex items-start gap-1.5 text-xs text-danger-text', className)}
    >
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export default FieldError;
