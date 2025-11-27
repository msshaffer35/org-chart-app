/**
 * Metric Calculation Service
 * 
 * Calculates organizational metrics from graph data (nodes and edges).
 */

export const metricCalculationService = {
    /**
     * Calculate all metrics for a given set of nodes and edges
     * @param {Array} nodes 
     * @param {Array} edges 
     * @returns {Object} Calculated metrics
     */
    calculateMetrics: (nodes, edges) => {
        if (!nodes || nodes.length === 0) return null;

        return {
            totalHeadcount: nodes.length,
            layers: metricCalculationService.calculateLayers(nodes, edges),
            spanOfControl: metricCalculationService.calculateSpanOfControl(nodes, edges),
            deptDistribution: metricCalculationService.calculateDeptDistribution(nodes)
        };
    },

    /**
     * Calculate the maximum depth (layers) of the org chart
     */
    calculateLayers: (nodes, edges) => {
        if (nodes.length === 0) return 0;

        // Build adjacency list
        const adj = {};
        const hasParent = new Set();

        edges.forEach(edge => {
            if (!adj[edge.source]) adj[edge.source] = [];
            adj[edge.source].push(edge.target);
            hasParent.add(edge.target);
        });

        // Find roots (nodes with no parents)
        const roots = nodes.filter(n => !hasParent.has(n.id));

        if (roots.length === 0 && nodes.length > 0) return 1; // Circular or disconnected, fallback

        let maxDepth = 0;

        const traverse = (nodeId, depth) => {
            if (depth > maxDepth) maxDepth = depth;
            const children = adj[nodeId] || [];
            children.forEach(childId => traverse(childId, depth + 1));
        };

        roots.forEach(root => traverse(root.id, 1));
        return maxDepth;
    },

    /**
     * Calculate average span of control (manager to report ratio)
     */
    calculateSpanOfControl: (nodes, edges) => {
        const managers = new Set(edges.map(e => e.source));
        if (managers.size === 0) return 0;

        // Total relationships / Total managers
        return Number((edges.length / managers.size).toFixed(1));
    },

    /**
     * Calculate percentage distribution by department
     */
    calculateDeptDistribution: (nodes) => {
        const distribution = {};
        let totalWithDept = 0;

        nodes.forEach(node => {
            const dept = node.data?.department || 'Unassigned';
            if (dept) {
                distribution[dept] = (distribution[dept] || 0) + 1;
                totalWithDept++;
            }
        });

        // Convert to percentages
        const percentages = {};
        Object.keys(distribution).forEach(dept => {
            percentages[dept] = Number(((distribution[dept] / nodes.length) * 100).toFixed(1));
        });

        return percentages;
    }
};
