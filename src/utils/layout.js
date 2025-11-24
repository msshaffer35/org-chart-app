import dagre from 'dagre';

const nodeWidth = 256; // Width of OrgNode (w-64 = 16rem = 256px)
const nodeHeight = 140; // Approx height

export const getLayoutedElements = (nodes, edges, direction = 'TB', spacing = 100) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: spacing,
        nodesep: spacing / 2 // Usually nodesep is smaller than ranksep
    });

    // Filter out hidden nodes for layout calculation
    const visibleNodes = nodes.filter(n => !n.hidden);
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    visibleNodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        // Only add edge if both source and target are visible
        if (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) {
            dagreGraph.setEdge(edge.source, edge.target);
        }
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        // If node is hidden, return as is (or maybe don't update position?)
        if (node.hidden) return node;

        const nodeWithPosition = dagreGraph.node(node.id);

        // Safety check if dagre didn't layout this node for some reason
        if (!nodeWithPosition) return node;

        node.targetPosition = direction === 'LR' ? 'left' : 'top';
        node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};
