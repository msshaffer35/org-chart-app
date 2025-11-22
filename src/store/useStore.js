import { create } from 'zustand';
import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from 'reactflow';
import { storageService } from '../services/storageService';
import { getLayoutedElements } from '../utils/layout';

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const debouncedSave = debounce((state) => {
    storageService.saveChart({
        nodes: state.nodes,
        edges: state.edges
    });
}, 1000);

const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    isLoading: false,
    error: null,

    settings: {
        spacing: 100,
        layoutDirection: 'TB',
        edgeType: 'smoothstep',
        visibleFields: {
            name: true,
            role: true,
            department: true,
            image: true,
        },
    },

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
        debouncedSave(get());
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
        debouncedSave(get());
    },

    onConnect: (connection) => {
        const { settings } = get();
        set({
            edges: addEdge({ ...connection, type: settings.edgeType }, get().edges),
        });
        debouncedSave(get());
    },

    setNodes: (nodes) => {
        set({ nodes });
        debouncedSave(get());
    },
    setEdges: (edges) => {
        set({ edges });
        debouncedSave(get());
    },

    updateSettings: (newSettings) => {
        set((state) => {
            const updatedSettings = { ...state.settings, ...newSettings };

            // If edge type changed, update all edges
            let newEdges = state.edges;
            if (newSettings.edgeType && newSettings.edgeType !== state.settings.edgeType) {
                newEdges = state.edges.map(e => ({ ...e, type: newSettings.edgeType }));
            }

            const newState = { settings: updatedSettings, edges: newEdges };
            debouncedSave({ ...state, ...newState });
            return newState;
        });

        // Trigger layout if spacing or direction changed
        if (newSettings.spacing || newSettings.layoutDirection) {
            get().layoutNodes();
        }
    },

    layoutNodes: (direction) => {
        const { nodes, edges, settings } = get();
        // Use passed direction or fallback to settings
        const dir = direction || settings.layoutDirection;

        // Update settings if direction explicitly passed
        if (direction && direction !== settings.layoutDirection) {
            set(state => ({ settings: { ...state.settings, layoutDirection: direction } }));
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            dir,
            settings.spacing // Pass spacing to layout util (need to update util)
        );
        set({ nodes: [...layoutedNodes], edges: [...layoutedEdges] });
        debouncedSave(get());
    },

    // Helper to add a single node
    addNode: (node) => {
        set((state) => {
            const newState = { nodes: [...state.nodes, node] };
            debouncedSave({ ...state, ...newState });
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
            debouncedSave({ ...state, ...newState });
            return newState;
        });
    },

    addReport: (parentId) => {
        const { nodes, edges, layoutNodes } = get();
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

        const newEdge = {
            id: `e${parentId}-${newId}`,
            source: parentId,
            target: newId,
            type: 'smoothstep',
        };

        set({
            nodes: [...nodes, newNode],
            edges: [...edges, newEdge]
        });

        // Trigger layout after a brief delay to allow render
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

        // Add new edge
        newEdges.push({
            id: `e${newParentId}-${childId}`,
            source: newParentId,
            target: childId,
            type: 'smoothstep',
        });

        set({ edges: newEdges });
        debouncedSave(get());

        // Auto-layout
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
        debouncedSave(get());
    },

    // Persistence Actions
    loadChart: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await storageService.loadChart();
            if (data) {
                set({ nodes: data.nodes || [], edges: data.edges || [] });
            }
        } catch (err) {
            set({ error: 'Failed to load chart' });
        } finally {
            set({ isLoading: false });
        }
    },

    resetChart: async () => {
        await storageService.clearChart();
        set({ nodes: [], edges: [] });
    }
}));

export default useStore;
