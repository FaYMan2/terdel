import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isIdentity?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
  isForeignKey: boolean;
  targetTable: string | null;
  targetColumn: string | null;
}

interface TableSchema {
  name: string;
  columns: Column[];
}

interface TableSchemaProps {
  tables: TableSchema[];
}

export function SchemaTable({ tables }: TableSchemaProps) {
  const initialNodes: Node[] = tables.map((table, index) => ({
    id: table.name,
    type: 'default',
    data: {
      label: (
        <div className="p-2 bg-white rounded shadow">
          <h3 className="font-medium mb-2">{table.name}</h3>
          <ul>
            {table.columns.map((column) => (
              <li key={column.name}>
                <span>{column.name} </span>
                <span className="text-sm text-gray-500">({column.type})</span>
                {column.isPrimary && <strong> [PK]</strong>}
                {column.isForeignKey && <em> [FK]</em>}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    position: { x: 200 * index, y: 100 * index },
  }));

  const initialEdges: Edge[] = tables.flatMap((table) =>
    table.columns
      .filter((column) => column.isForeignKey && column.targetTable)
      .map((column) => ({
        id: `${table.name}-${column.name}-${column.targetTable}`,
        source: table.name,
        target: column.targetTable!,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      }))
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-screen h-screen">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    >
      <Background />
      <Controls />
    </ReactFlow>
</div>
  );
}