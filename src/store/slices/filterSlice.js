import { calculateNodeDepths, getHiddenDescendantSummary } from '../../utils/graphUtils';

/**
 * Filter Slice
 * Manages filtering, search, and visibility management
 */
export const createFilterSlice = (set, get) => ({
    // State
    filterState: {
        type: 'NONE', // 'NONE', 'SUBTREE', 'CRITERIA'
        value: null
    },

    // Actions
    setFilter: (type, value) => {
        set({ filterState: { type, value } });
        get().applyFilter();
    },

    clearFilter: () => {
        set({ filterState: { type: 'NONE', value: null } });
        get().applyFilter();
    },

    applyFilter: () => {
        const { nodes, edges, filterState, settings } = get();
        let newNodes = [...nodes];

        // 1. Base Visibility (Filter Panel)
        let visibleIds = new Set(newNodes.map(n => n.id));

        if (filterState.type === 'SUBTREE') {
            const rootId = filterState.value;
            const getDescendants = (id) => {
                const children = edges.filter(e => e.source === id).map(e => e.target);
                let descendants = [...children];
                children.forEach(child => {
                    descendants = [...descendants, ...getDescendants(child)];
                });
                return descendants;
            };
            visibleIds = new Set([rootId, ...getDescendants(rootId)]);
        } else if (filterState.type === 'CRITERIA') {
            const { field, value } = filterState.value;

            const matchingNodes = nodes.filter(n => {
                if (!n.data) return false;
                if (field === 'scrum' || field === 'coe' || field === 'region' || field === 'function' || field === 'subFunction') {
                    if (!n.data.teamType) return false;
                    if (field === 'scrum') return n.data.teamType.scrum === value;
                    if (field === 'coe') return n.data.teamType.coe === value;
                    if (field === 'region') return n.data.teamType.regions?.includes(value);
                    if (field === 'function') return n.data.teamType.functions?.includes(value);
                    if (field === 'subFunction') return n.data.teamType.subFunctions?.includes(value);
                }
                return n.data[field] === value;
            });

            const matchingIds = new Set(matchingNodes.map(n => n.id));
            visibleIds = new Set(matchingIds); // Start with matches

            // Add ancestors
            const parentMap = {};
            edges.forEach(e => {
                parentMap[e.target] = e.source;
            });

            matchingNodes.forEach(node => {
                let curr = node.id;
                while (parentMap[curr]) {
                    curr = parentMap[curr];
                    visibleIds.add(curr);
                }
            });
        }

        // 2. De-identification Level Filtering
        if (settings.deidentifiedMode && settings.deidentificationSettings.maxLevels > 0) {
            const depths = calculateNodeDepths(nodes, edges);
            const maxDepth = settings.deidentificationSettings.maxLevels - 1; // 0-indexed depth

            // Filter out nodes deeper than maxDepth
            // BUT, we need to keep track of them for aggregation on the boundary nodes

            // First, mark nodes as hidden if they exceed depth
            // We intersect with existing visibleIds
            const levelVisibleIds = new Set();

            nodes.forEach(node => {
                if (depths[node.id] <= maxDepth) {
                    levelVisibleIds.add(node.id);
                }
            });

            // Intersect
            visibleIds = new Set([...visibleIds].filter(x => levelVisibleIds.has(x)));

            // Calculate Aggregations for Boundary Nodes
            // A boundary node is one that:
            // 1. Is visible (in visibleIds)
            // 2. Has at least one hidden descendant
            newNodes = newNodes.map(node => {
                const isVisible = visibleIds.has(node.id);

                if (isVisible) {
                    // Check if this node has any hidden children
                    const childEdges = edges.filter(e => e.source === node.id);
                    const hasHiddenChildren = childEdges.some(e => !visibleIds.has(e.target));

                    if (hasHiddenChildren) {
                        // This is a boundary node - calculate summary of hidden descendants
                        const summary = getHiddenDescendantSummary(node.id, edges, nodes, visibleIds);
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                _deidSummary: summary // Inject summary into data
                            }
                        };
                    }
                }

                // Not a boundary - clear any existing summary
                const { _deidSummary, ...restData } = node.data;
                return { ...node, data: restData };
            });
        } else {
            // Clear summaries if mode disabled
            newNodes = newNodes.map(node => {
                if (node.data._deidSummary) {
                    const { _deidSummary, ...restData } = node.data;
                    return { ...node, data: restData };
                }
                return node;
            });
        }

        // Apply Final Visibility
        newNodes = newNodes.map(n => ({
            ...n,
            hidden: !visibleIds.has(n.id)
        }));

        set({ nodes: newNodes });

        setTimeout(() => {
            get().layoutNodes();
        }, 0);
    },
});
