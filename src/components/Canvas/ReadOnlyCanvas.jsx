import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import OrgNode from '../Nodes/OrgNode';
import TextNode from '../Nodes/TextNode';

const nodeTypes = {
    org: OrgNode,
    text: TextNode,
};

const ReadOnlyCanvas = ({ nodes, edges }) => {
    // Memoize nodes/edges to prevent unnecessary re-renders if parent passes same ref
    const flowNodes = useMemo(() => nodes.map(n => ({ ...n, draggable: false, connectable: false })), [nodes]);
    const flowEdges = useMemo(() => edges.map(e => ({ ...e, animated: false })), [edges]);

    return (
        <div className="w-full h-full bg-slate-50 border-r border-slate-200">
            <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                zoomOnScroll={true}
                panOnScroll={true}
            >
                <Background color="#ccc" gap={20} />
                <Controls showInteractive={false} />
                <MiniMap nodeColor="#cbd5e1" />
            </ReactFlow>
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded shadow-sm border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider pointer-events-none">
                Base Version
            </div>
        </div>
    );
};

export default ReadOnlyCanvas;
