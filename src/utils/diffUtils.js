
/**
 * Compares two sets of org chart nodes and returns the differences.
 * 
 * @param {Array} baseNodes - The original state (Actual)
 * @param {Array} targetNodes - The new state (Scenario)
 * @param {Array} baseEdges - Original edges (to detect moves)
 * @param {Array} targetEdges - New edges (to detect moves)
 * @returns {Object} Diff result { added: [], removed: [], modified: [], moved: [] }
 */
export const diffOrgCharts = (baseNodes, targetNodes, baseEdges, targetEdges) => {
    const diff = {
        added: [],
        removed: [],
        modified: [],
        moved: []
    };

    const baseMap = new Map(baseNodes.map(n => [n.id, n]));
    const targetMap = new Map(targetNodes.map(n => [n.id, n]));

    // 1. Detect Added Nodes
    targetNodes.forEach(node => {
        if (!baseMap.has(node.id)) {
            diff.added.push(node);
        }
    });

    // 2. Detect Removed Nodes
    baseNodes.forEach(node => {
        if (!targetMap.has(node.id)) {
            diff.removed.push(node);
        }
    });

    // 3. Detect Modified & Moved Nodes
    targetNodes.forEach(targetNode => {
        const baseNode = baseMap.get(targetNode.id);
        if (baseNode) {
            // Check for Property Changes
            const changes = [];

            // Compare specific data fields we care about
            const fieldsToCheck = ['label', 'role', 'department', 'employeeType', 'location'];
            fieldsToCheck.forEach(field => {
                const baseVal = baseNode.data[field];
                const targetVal = targetNode.data[field];
                if (baseVal !== targetVal) {
                    changes.push({ field, oldValue: baseVal, newValue: targetVal });
                }
            });

            // Check custom fields if any (naive check)
            // ...

            if (changes.length > 0) {
                diff.modified.push({ id: targetNode.id, changes });
            }

            // Check for Moves (Parent Change)
            const baseParent = getParentId(baseNode.id, baseEdges);
            const targetParent = getParentId(targetNode.id, targetEdges);

            if (baseParent !== targetParent) {
                diff.moved.push({
                    id: targetNode.id,
                    oldParent: baseParent,
                    newParent: targetParent
                });
            }
        }
    });

    return diff;
};

const getParentId = (childId, edges) => {
    const edge = edges.find(e => e.target === childId);
    return edge ? edge.source : null;
};
