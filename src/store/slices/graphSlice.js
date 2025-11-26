import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from 'reactflow';
import { getLayoutedElements } from '../../utils/layout';

/**
 * Graph Slice
 * Manages the core graph data structure and operations (nodes, edges, layout)
 */
export const createGraphSlice = (set, get) => ({
    // State
    nodes: [],
    edges: [],
    isLoading: false,
    error: null,

    // React Flow change handlers
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection) => {
        const { settings } = get();
        const edgeStyle = settings.edgeStroke === 'dotted' ? { strokeDasharray: '5,5' } : {};
        set({
            edges: addEdge({ ...connection, type: settings.edgeType, style: edgeStyle }, get().edges),
        });
    },

    // Direct setters
    setNodes: (nodes) => {
        set({ nodes });
    },

    setEdges: (edges) => {
        set({ edges });
    },

    // Single node operations
    addNode: (node) => {
        set((state) => {
            const newState = { nodes: [...state.nodes, node] };
            return newState;
        });
    },

    updateNodeData: (id, newData) => {
        set((state) => {
            const newNodes = state.nodes.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            });
            const newState = { nodes: newNodes };
            return newState;
        });
    },

    updateParentEdgeStyle: (nodeId, styleType) => {
        set((state) => {
            const newEdges = state.edges.map((edge) => {
                if (edge.target === nodeId) {
                    return {
                        ...edge,
                        style: styleType === 'dotted' ? { strokeDasharray: '5,5' } : {}
                    };
                }
                return edge;
            });
            const newState = { edges: newEdges };
            return newState;
        });
    },

    // Layout operations
    layoutNodes: (direction) => {
        const { nodes, edges, settings } = get();
        // Use passed direction or fallback to settings
        const dir = direction || settings.layoutDirection;

        // Update settings if direction explicitly passed
        if (direction && direction !== settings.layoutDirection) {
            set(state => ({ settings: { ...state.settings, layoutDirection: direction } }));
        }

        // Calculate center of current visible nodes before layout
        const visibleNodes = nodes.filter(n => !n.hidden);
        let centerX = 0, centerY = 0;
        if (visibleNodes.length > 0) {
            const sumX = visibleNodes.reduce((sum, n) => sum + n.position.x, 0);
            const sumY = visibleNodes.reduce((sum, n) => sum + n.position.y, 0);
            centerX = sumX / visibleNodes.length;
            centerY = sumY / visibleNodes.length;
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            dir,
            settings.spacing
        );

        // Calculate center of layouted nodes
        const visibleLayoutedNodes = layoutedNodes.filter(n => !n.hidden);
        let newCenterX = 0, newCenterY = 0;
        if (visibleLayoutedNodes.length > 0) {
            const sumX = visibleLayoutedNodes.reduce((sum, n) => sum + n.position.x, 0);
            const sumY = visibleLayoutedNodes.reduce((sum, n) => sum + n.position.y, 0);
            newCenterX = sumX / visibleLayoutedNodes.length;
            newCenterY = sumY / visibleLayoutedNodes.length;
        }

        // Shift all nodes to maintain the original center position
        const offsetX = centerX - newCenterX;
        const offsetY = centerY - newCenterY;
        const centeredNodes = layoutedNodes.map(n => ({
            ...n,
            position: {
                x: n.position.x + offsetX,
                y: n.position.y + offsetY
            }
        }));

        set({ nodes: [...centeredNodes], edges: [...layoutedEdges] });
    },

    // Complex operations
    addReport: (parentId) => {
        const { nodes, edges } = get();
        const parentNode = nodes.find(n => n.id === parentId);
        if (!parentNode) return;

        const newId = `node-${Date.now()}`;
        const newNode = {
            id: newId,
            type: 'org',
            data: {
                label: 'New Employee',
                role: 'Role',
                department: parentNode.data.department, // Inherit dept
                color: parentNode.data.color, // Inherit color
            },
            position: { x: parentNode.position.x, y: parentNode.position.y + 100 }, // Initial pos
        };

        const { settings } = get();
        const edgeStyle = settings.edgeStroke === 'dotted' ? { strokeDasharray: '5,5' } : {};

        const newEdge = {
            id: `e${parentId}-${newId}`,
            source: parentId,
            target: newId,
            type: settings.edgeType || 'smoothstep',
            style: edgeStyle,
        };

        set({
            nodes: [...nodes, newNode],
            edges: [...edges, newEdge]
        });

        // Trigger layout after a brief delay to allow render (will auto-center)
        setTimeout(() => {
            get().layoutNodes('TB');
        }, 10);
    },

    reparentNode: (childId, newParentId) => {
        const { edges, nodes } = get();

        // Prevent self-parenting
        if (childId === newParentId) return;

        // Prevent cycles (simple check: is newParent a descendant of child?)
        const isDescendant = (parent, target) => {
            const children = edges.filter(e => e.source === parent).map(e => e.target);
            if (children.includes(target)) return true;
            return children.some(child => isDescendant(child, target));
        };
        if (isDescendant(childId, newParentId)) {
            alert("Cannot move a node under its own descendant.");
            return;
        }

        // Remove existing parent edge
        const newEdges = edges.filter(e => e.target !== childId);

        const { settings } = get();
        const edgeStyle = settings.edgeStroke === 'dotted' ? { strokeDasharray: '5,5' } : {};

        // Add new edge
        newEdges.push({
            id: `e${newParentId}-${childId}`,
            source: newParentId,
            target: childId,
            type: settings.edgeType || 'smoothstep',
            style: edgeStyle,
        });

        set({ edges: newEdges });

        // Auto-layout (will auto-center)
        setTimeout(() => {
            get().layoutNodes('TB');
        }, 10);
    },

    deleteNode: (nodeId) => {
        const { nodes, edges } = get();

        // Find all descendants recursively
        const getDescendants = (id) => {
            const children = edges.filter(e => e.source === id).map(e => e.target);
            let descendants = [...children];
            children.forEach(child => {
                descendants = [...descendants, ...getDescendants(child)];
            });
            return descendants;
        };

        const nodesToDelete = [nodeId, ...getDescendants(nodeId)];

        const newNodes = nodes.filter(n => !nodesToDelete.includes(n.id));
        const newEdges = edges.filter(e => !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target));

        set({ nodes: newNodes, edges: newEdges });
    },
});
