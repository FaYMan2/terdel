import { Handle, Position } from '@xyflow/react';
import { KeyRound, Hash, Fingerprint, Circle, Diamond } from 'lucide-react';

export function TableNode({ data }: { data: any }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{data.name}</h3>
        </div>
      </div>  
      <div className="divide-y">
        {data.columns.map((column) => (
          <div
            key={column.name}
            className="flex items-center justify-between py-2 relative"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {column.isPrimary && <KeyRound className="h-4 w-4 text-primary" />}
                {column.isIdentity && <Hash className="h-4 w-4 text-primary" />}
                {column.isUnique && <Fingerprint className="h-4 w-4 text-primary" />}
                {column.isNullable && <Circle className="h-4 w-4 text-primary" />}
                {!column.isNullable && <Diamond className="h-4 w-4 text-primary" />}
              </div>
              <span className="font-medium">{column.name}</span>
            </div>
            <span className="ml-2 px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
              {column.type}
            </span>

            <Handle
              type="source"
              position={Position.Right}
              style={{ background: '#7c3aed', top: '50%' }}
              id={`${data.name}-${column.name}-source`}
            />

            <Handle
              type="target"
              position={Position.Left}
              style={{ background: '#7c3aed', top: '50%' }}
              id={`${data.name}-${column.name}-target`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
