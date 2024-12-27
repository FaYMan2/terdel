import { KeyRound, Hash, Fingerprint, Circle, Diamond } from 'lucide-react';

export function SchemaLegend() {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4" />
        <span>Primary key</span>
      </div>
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4" />
        <span>Identity</span>
      </div>
      <div className="flex items-center gap-2">
        <Fingerprint className="h-4 w-4" />
        <span>Unique</span>
      </div>
      <div className="flex items-center gap-2">
        <Circle className="h-4 w-4" />
        <span>Nullable</span>
      </div>
      <div className="flex items-center gap-2">
        <Diamond className="h-4 w-4" />
        <span>Non-Nullable</span>
      </div>
    </div>
  );
}