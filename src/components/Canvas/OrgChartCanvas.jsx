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

    // Load initial data with layout if empty (optional, can be moved to App or store)
    useEffect(() => {
        if (nodes.length === 0 && initialNodes.length > 0) {
            // Only load initial dummy data if store is empty and we haven't loaded anything
            // But wait, loadChart runs on App mount.
            // If we want to preserve the "demo" feel for a new user, we can check if loadChart returned empty.
            // For now, let's disable this auto-reset to dummy data to avoid overwriting saved data.
            // Or better, only set if we know we are in a "fresh" state.
            // Let's just rely on the store's loadChart.
        }
    }, []);

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
