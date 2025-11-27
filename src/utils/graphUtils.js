
/**
 * Calculates the depth of each node in the tree.
 * Root nodes (no incoming edges) are at depth 0.
 * @param {Array} nodes 
 * @param {Array} edges 
 * @returns {Object} Map of nodeId -> depth
 */
export const calculateNodeDepths = (nodes, edges) => {
    const depths = {};
    const parentMap = {};

    // Build parent map
    edges.forEach(edge => {
        parentMap[edge.target] = edge.source;
    });

    // Helper to find depth
    const getDepth = (id, visited = new Set()) => {
        if (visited.has(id)) return 0; // Cycle detection
        visited.add(id);

        if (depths[id] !== undefined) return depths[id];

        const parentId = parentMap[id];
        if (!parentId) {
            depths[id] = 0;
            return 0;
        }

        const depth = getDepth(parentId, visited) + 1;
        depths[id] = depth;
        return depth;
    };

    nodes.forEach(node => {
        getDepth(node.id);
    });

    return depths;
};

/**
 * Aggregates metadata for all descendants of a given node.
 * Used for the "De-identified View" summary card.
 * @param {string} nodeId
 * @param {Array} edges
 * @param {Array} nodes
 * @returns {Object} Summary object { count, metadata: { ... } }
 */
export const getDescendantSummary = (nodeId, edges, nodes) => {
    const childrenMap = {};
    edges.forEach(edge => {
        if (!childrenMap[edge.source]) childrenMap[edge.source] = [];
        childrenMap[edge.source].push(edge.target);
    });

    const summary = {
        count: 0,
        metadata: {
            employeeTypes: {},
            scrumTeams: {},
            coes: {},
            departments: {},
            regions: {},
            functions: {},
            subfunctions: {}
        }
    };

    const processNode = (id) => {
        const children = childrenMap[id] || [];
        children.forEach(childId => {
            const childNode = nodes.find(n => n.id === childId);
            if (childNode) {
                summary.count++;

                // Aggregate Metadata
                if (childNode.data) {
                    const { employeeType, teamType, department } = childNode.data;

                    if (employeeType) {
                        summary.metadata.employeeTypes[employeeType] = (summary.metadata.employeeTypes[employeeType] || 0) + 1;
                    }
                    if (department) {
                        summary.metadata.departments[department] = (summary.metadata.departments[department] || 0) + 1;
                    }
                    if (teamType) {
                        if (teamType.scrum) {
                            summary.metadata.scrumTeams[teamType.scrum] = (summary.metadata.scrumTeams[teamType.scrum] || 0) + 1;
                        }
                        if (teamType.coe) {
                            summary.metadata.coes[teamType.coe] = (summary.metadata.coes[teamType.coe] || 0) + 1;
                        }
                        if (Array.isArray(teamType.regions)) {
                            teamType.regions.forEach(region => {
                                summary.metadata.regions[region] = (summary.metadata.regions[region] || 0) + 1;
                            });
                        }
                    }

                    // Aggregate Functions and Subfunctions
                    // Assuming these are direct properties on data, or we can check overlayFields if they are dynamic
                    if (Array.isArray(teamType.functions)) {
                        teamType.functions.forEach(f => {
                            summary.metadata.functions[f] = (summary.metadata.functions[f] || 0) + 1;
                        });
                    }
                    if (Array.isArray(teamType.subFunctions)) {
                        teamType.subFunctions.forEach(sf => {
                            summary.metadata.subfunctions[sf] = (summary.metadata.subfunctions[sf] || 0) + 1;
                        });
                    }
                }

                // Recurse
                processNode(childId);
            }
        });
    };

    processNode(nodeId);
    return summary;
};

/**
 * Aggregates metadata for all HIDDEN descendants of a given node.
 * Only counts descendants that are not in visibleIds set.
 * Used for the "De-identified View" summary card to show accurate counts of hidden nodes.
 * @param {string} nodeId - The boundary node ID
 * @param {Array} edges - All edges
 * @param {Array} nodes - All nodes
 * @param {Set} visibleIds - Set of visible node IDs
 * @returns {Object} Summary object { count, metadata: { ... } }
 */
export const getHiddenDescendantSummary = (nodeId, edges, nodes, visibleIds) => {
    const childrenMap = {};
    edges.forEach(edge => {
        if (!childrenMap[edge.source]) childrenMap[edge.source] = [];
        childrenMap[edge.source].push(edge.target);
    });

    const summary = {
        count: 0,
        metadata: {
            employeeTypes: {},
            scrumTeams: {},
            coes: {},
            departments: {},
            regions: {},
            functions: {},
            subfunctions: {}
        }
    };

    const processNode = (id) => {
        const children = childrenMap[id] || [];
        children.forEach(childId => {
            // Only process if this child is HIDDEN
            if (!visibleIds.has(childId)) {
                const childNode = nodes.find(n => n.id === childId);
                if (childNode) {
                    summary.count++;

                    // Aggregate Metadata
                    if (childNode.data) {
                        const { employeeType, teamType, department } = childNode.data;

                        if (employeeType) {
                            summary.metadata.employeeTypes[employeeType] =
                                (summary.metadata.employeeTypes[employeeType] || 0) + 1;
                        }
                        if (department) {
                            summary.metadata.departments[department] =
                                (summary.metadata.departments[department] || 0) + 1;
                        }
                        if (teamType) {
                            if (teamType.scrum) {
                                summary.metadata.scrumTeams[teamType.scrum] =
                                    (summary.metadata.scrumTeams[teamType.scrum] || 0) + 1;
                            }
                            if (teamType.coe) {
                                summary.metadata.coes[teamType.coe] =
                                    (summary.metadata.coes[teamType.coe] || 0) + 1;
                            }
                            if (Array.isArray(teamType.regions)) {
                                teamType.regions.forEach(region => {
                                    summary.metadata.regions[region] =
                                        (summary.metadata.regions[region] || 0) + 1;
                                });
                            }
                            if (Array.isArray(teamType.functions)) {
                                teamType.functions.forEach(f => {
                                    summary.metadata.functions[f] =
                                        (summary.metadata.functions[f] || 0) + 1;
                                });
                            }
                            if (Array.isArray(teamType.subFunctions)) {
                                teamType.subFunctions.forEach(sf => {
                                    summary.metadata.subfunctions[sf] =
                                        (summary.metadata.subfunctions[sf] || 0) + 1;
                                });
                            }
                        }
                    }

                    // Recurse to count ALL hidden descendants (not just direct children)
                    processNode(childId);
                }
            }
        });
    };

    processNode(nodeId);
    return summary;
};
