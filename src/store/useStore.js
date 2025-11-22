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
        set({
            edges: addEdge(connection, get().edges),
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

    layoutNodes: (direction = 'TB') => {
        const { nodes, edges } = get();
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
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
