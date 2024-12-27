import { Table } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { KeyRound, Hash, Fingerprint, Circle, Diamond,} from 'lucide-react';
import { useDraggable } from '@/hooks/useDraggable';

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isIdentity?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
}

interface SchemaTableProps {
  name: string;
  columns: Column[];
  initialPosition?: { x: number; y: number };
}

export function SchemaTable({ name, columns, initialPosition }: SchemaTableProps) {
  const { position, isDragging, handleMouseDown } = useDraggable(initialPosition);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow",
        "absolute cursor-move",
        isDragging && "opacity-90 shadow-lg"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: '400px',
      }}
    >
      <div 
        className="flex items-center justify-between p-4 border-b"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-background rounded">
            <Table className="h-4 w-4" />
          </div>
          <h3 className="font-medium">{name}</h3>
        </div>
      </div>
      <div className="divide-y">
        {columns.map((column) => (
          <div
            key={column.name}
            className="flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {column.isPrimary && <KeyRound className="h-4 w-4 text-primary" />}
                {column.isIdentity && <Hash className="h-4 w-4 text-primary" />}
                {column.isUnique && <Fingerprint className="h-4 w-4 text-primary" />}
                {column.isNullable && <Circle className="h-4 w-4 text-primary" />}
                {!column.isNullable && <Diamond className="h-4 w-4 text-primary" />}
              </div>
              <span>{column.name}</span>
            </div>
            <span className={cn(
              "px-2 py-1 rounded text-sm",
              "bg-secondary text-secondary-foreground"
            )}>
              {column.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}