import { useCallback,useMemo } from 'react';
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
import { TableNode } from './TableNode';
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
  const tableNodeType = useMemo(() => ({ tableNodeType: TableNode }), []);

  const initialNodes = tables.map((table, index) => ({
    id: table.name,
    type: 'tableNodeType',
    data : {
      ...table
    },
    position: { x: 200 * index, y: 150 * index },
  }));

  const initialEdges = tables.flatMap((table) =>
    table.columns
      .filter((column) => column.isForeignKey && column.targetTable && column.targetColumn)
      .map((column) => ({
        id: `${table.name}-${column.name}-${column.targetTable}-${column.targetColumn}`,
        source: table.name, 
        sourceHandle: `${table.name}-${column.name}-source`, 
        target: column.targetTable, 
        targetHandle: `${column.targetTable}-${column.targetColumn}-target`,
        animated: true,
        style: { stroke: '#7c3aed', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
        label: `${column.name} → ${column.targetTable}.${column.targetColumn}`,
        labelStyle: { fill: '#7c3aed', fontWeight: 'bold' },
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
        nodeTypes={tableNodeType}
        fitView
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
