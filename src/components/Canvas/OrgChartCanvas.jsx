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
import TextNode from '../Nodes/TextNode';
import { getLayoutedElements } from '../../utils/layout';
import { parseCSV } from '../../utils/csvImporter';
import { exportToPptx } from '../../services/pptxExportService';
import { Download } from 'lucide-react';
import FilterPanel from './FilterPanel';

const nodeTypes = {
    org: OrgNode,
    text: TextNode,
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
        nodes, edges, settings, onNodesChange, onEdgesChange, onConnect, reparentNode, deleteNode, addNode
    } = useStore();

    const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let newNode;

            if (type === 'org') {
                newNode = {
                    id: `node-${Date.now()}`,
                    type,
                    position,
                    data: {
                        label: 'New Employee',
                        role: 'New Role',
                        department: 'Department',
                        color: 'bg-blue-500'
                    },
                };
            } else if (type === 'text') {
                newNode = {
                    id: `text-${Date.now()}`,
                    type,
                    position,
                    data: {
                        label: 'Double click to edit'
                    },
                };
            }

            addNode(newNode);
        },
        [reactFlowInstance, addNode],
    );

    const onNodeDragStop = useCallback((event, node) => {
        // Simple collision detection
        // We check if the dragged node's center is inside another node's bounding box
        const nodeCenter = {
            x: node.position.x + 128, // half width (256/2)
            y: node.position.y + 70,  // half height (140/2)
        };

        const targetNode = nodes.find(n => {
            if (n.id === node.id) return false;

            // Check collision with other nodes
            // Assuming standard node size w-64 (256px) x approx 140px
            return (
                nodeCenter.x >= n.position.x &&
                nodeCenter.x <= n.position.x + 256 &&
                nodeCenter.y >= n.position.y &&
                nodeCenter.y <= n.position.y + 140
            );
        });

        if (targetNode) {
            if (window.confirm(`Move "${node.data.label}" to report to "${targetNode.data.label}"?`)) {
                reparentNode(node.id, targetNode.id);
            }
        }
    }, [nodes, reparentNode]);

    const onNodesDelete = useCallback((deletedNodes) => {
        // React Flow handles the UI removal, but we want to ensure our store logic runs (cascading delete)
        // However, onNodesChange already handles basic removal.
        // If we want cascading delete on key press, we should intercept it or use onNodesDelete.
        // Let's use onNodesDelete to trigger our custom delete logic for the first node found.
        // Note: React Flow might have already removed them from its internal state, so we need to be careful.
        // Actually, simpler: just let React Flow handle selection, and we provide a Delete button.
        // OR, we override the default delete behavior.

        // For now, let's rely on a custom Delete button in the UI for cascading delete, 
        // as the default Backspace key might just remove the node and leave orphans.
        // To force cascading on Backspace, we'd need to handle onKeyDown or use the deleteKeyCode prop.

        deletedNodes.forEach(node => {
            deleteNode(node.id);
        });
    }, [deleteNode]);

    const handleExportPPTX = async () => {
        console.log("Export button clicked");
        console.log("Nodes:", nodes);
        console.log("Edges:", edges);
        try {
            await exportToPptx(nodes, edges, settings);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. See console.");
        }
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
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                onNodesDelete={onNodesDelete}
                onInit={setReactFlowInstance}
                onDragOver={onDragOver}
                onDrop={onDrop}
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

                <Panel position="top-left">
                    <FilterPanel />
                </Panel>

                <Panel position="top-right" className="bg-white p-2 rounded shadow-md flex gap-2">
                    <button
                        onClick={handleExportPPTX}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium transition-colors"
                        title="Export to PowerPoint"
                    >
                        <Download size={16} />
                        Export PPTX
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default OrgChartCanvas;
