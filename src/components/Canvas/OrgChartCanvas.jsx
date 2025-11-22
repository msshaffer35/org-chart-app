import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../../store/useStore';
import OrgNode from '../Nodes/OrgNode';
import { getLayoutedElements } from '../../utils/layout';
import { parseCSV } from '../../utils/csvImporter';
import OverlayControls from '../../features/Planning/OverlayControls';

const nodeTypes = {
    org: OrgNode,
};

// Initial dummy data for testing
const initialNodes = [
    { id: '1', type: 'org', position: { x: 250, y: 0 }, data: { label: 'Sarah CEO', role: 'CEO', department: 'Executive', color: 'bg-purple-600' } },
    { id: '2', type: 'org', position: { x: 100, y: 200 }, data: { label: 'Mike VP', role: 'VP Engineering', department: 'Engineering', color: 'bg-blue-500' } },
    { id: '3', type: 'org', position: { x: 400, y: 200 }, data: { label: 'Lisa VP', role: 'VP Product', department: 'Product', color: 'bg-green-500' } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
];

const OrgChartCanvas = () => {
    const {
        nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, setEdges
    } = useStore();

    const [activeOverlay, setActiveOverlay] = React.useState(null);

    const onLayout = useCallback((direction) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        );
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
    }, [nodes, edges, setNodes, setEdges]);

    const handleOverlayChange = (overlayType) => {
        if (activeOverlay === overlayType) {
            setActiveOverlay(null);
            // Reset nodes
            setNodes(nodes.map(n => ({
                ...n,
                data: { ...n.data, badges: [], overlay: null }
            })));
            return;
        }

        setActiveOverlay(overlayType);

        // Apply mock overlay data
        const newNodes = nodes.map(node => {
            let badges = [];
            let overlay = null;

            if (overlayType === 'skills') {
                // Mock logic: Randomly assign skill gaps
                if (Math.random() > 0.7) {
                    badges = ['#ef4444']; // Red for gap
                    overlay = 'skills';
                }
            } else if (overlayType === 'scrum') {
                // Mock logic: Assign random teams
                const teams = ['#3b82f6', '#10b981', '#8b5cf6'];
                badges = [teams[Math.floor(Math.random() * teams.length)]];
                overlay = 'scrum';
            }

            return {
                ...node,
                data: { ...node.data, badges, overlay }
            };
        });

        setNodes(newNodes);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        parseCSV(file, ({ nodes: newNodes, edges: newEdges }) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                newNodes,
                newEdges,
                'TB'
            );
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        });
    };

    // Load initial data with layout
    useEffect(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges,
            'TB'
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [setNodes, setEdges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
                className="bg-gray-50"
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap nodeColor={(n) => {
                    if (n.type === 'org') return '#3b82f6';
                    return '#eee';
                }} />

                <Panel position="top-left" className="flex flex-col gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-3 w-64">
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">Org Chart</h2>
                            <p className="text-xs text-gray-500">Manage your organization structure</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="block text-sm font-medium text-gray-700">Import Data</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                "
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onLayout('TB')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 transition-colors"
                            >
                                Vertical
                            </button>
                            <button
                                onClick={() => onLayout('LR')}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 transition-colors"
                            >
                                Horizontal
                            </button>
                        </div>
                    </div>

                    <OverlayControls
                        activeOverlay={activeOverlay}
                        onToggleOverlay={handleOverlayChange}
                    />
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default OrgChartCanvas;
