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
import { TableSchema } from '@/types';

interface TableSchemaProps {
  tables: TableSchema[];
}


const orderedTables = (Tables : TableSchema[]) : TableSchema[] => {
  const rank = (table : TableSchema) : number => {
    return table.columns.filter(column => column.isForeignKey).length
  }

  return Tables.sort((a : TableSchema,b : TableSchema) => rank(b) - rank(a))
}

function performDFS(
  tables: TableSchema[],
  table: TableSchema,
  positions: Record<string, { x: number; y: number }>,
  x: number,
  y: number,
  visited: Set<string>,
  yStep: number
) {
  if (visited.has(table.name)) return; 

  positions[table.name] = { x, y };
  visited.add(table.name);

  const targetTables = table.columns
    .filter((column) => column.isForeignKey && column.targetTable)
    .map((column) => column.targetTable!);

  let childY = y - yStep * Math.floor(targetTables.length / 2); 
  targetTables.forEach((targetTable) => {
    const target = tables.find((t) => t.name === targetTable);
    if (target) {
      performDFS(tables, target, positions, x + 500, childY, visited, yStep);
      childY += yStep; 
    }
  });
}

function generateNodePositions(tables: TableSchema[]): { id: string; position: { x: number; y: number } }[] {
  const sortedTables = orderedTables(tables); 
  const positions: Record<string, { x: number; y: number }> = {};
  const visited = new Set<string>();

  const yStep = 350; 
  let x = 0, y = 0; 
  sortedTables.forEach((table) => {
    if (!visited.has(table.name)) {
      performDFS(tables, table, positions, x, y, visited, yStep);
      y += yStep; 
    }
  });

  return Object.entries(positions).map(([id, position]) => ({ id, position }));
}



export function SchemaTable({ tables }: TableSchemaProps) {
  const tableNodeType = useMemo(() => ({ tableNodeType: TableNode }), []);
  const Positions = generateNodePositions(tables)
  console.log(Positions)
  const initialNodes = orderedTables(tables).map((table, index) => ({
    id: table.name,
    type: 'tableNodeType',
    data : {
      ...table
    },
    position : Positions.find((pos) => pos.id == table.name)?.position,
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
        type : "simplebezier"
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
