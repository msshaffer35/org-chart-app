import PptxGenJS from 'pptxgenjs';

// Constants
const PX_TO_INCH = 1 / 96;

/**
 * Exports the current nodes and edges to a PPTX file.
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} settings - App settings (for styling)
 */
export const exportToPptx = async (nodes, edges, settings) => {
    console.log("Starting PPTX export...", { nodes, edges, settings });
    try {
        const pres = new PptxGenJS();
        pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches

        const slide = pres.addSlide();

        // 1. Calculate Bounding Box of the Chart
        if (nodes.length === 0) {
            alert("No nodes to export.");
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            const x = node.position.x;
            const y = node.position.y;
            const w = node.width || 256;
            const h = node.height || 150;

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x + w > maxX) maxX = x + w;
            if (y + h > maxY) maxY = y + h;
        });

        // Add padding
        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const chartWidth = maxX - minX;
        const chartHeight = maxY - minY;

        // 2. Calculate Scale to Fit Slide
        const slideWidthPx = 10 * 96;
        const slideHeightPx = 5.625 * 96;

        const scaleX = slideWidthPx / chartWidth;
        const scaleY = slideHeightPx / chartHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up if it fits

        // Center offsets
        const offsetX = (slideWidthPx - chartWidth * scale) / 2;
        const offsetY = (slideHeightPx - chartHeight * scale) / 2;

        // Helpers
        const toInchX = (x) => ((x - minX) * scale + offsetX) * PX_TO_INCH;
        const toInchY = (y) => ((y - minY) * scale + offsetY) * PX_TO_INCH;
        const toInchDim = (v) => (v * scale) * PX_TO_INCH;

        // 3. Draw Nodes
        nodes.forEach(node => {
            const x = toInchX(node.position.x);
            const y = toInchY(node.position.y);

            if (node.type === 'org' || !node.type) {
                const w = toInchDim(256);
                const h = toInchDim(160);

                // Background Card
                slide.addShape(pres.ShapeType.rect, {
                    x: x, y: y, w: w, h: h,
                    fill: { color: 'FFFFFF' },
                    line: { color: 'E5E7EB', width: 1 },
                    shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 3, offset: 2 }
                });

                // Color Strip
                let stripColor = '3B82F6'; // blue-500
                if (node.data.color && node.data.color.startsWith('#')) {
                    stripColor = node.data.color.substring(1);
                } else if (node.data.color === 'bg-purple-600') stripColor = '9333EA';
                else if (node.data.color === 'bg-green-500') stripColor = '22C55E';
                else if (node.data.color === 'bg-red-500') stripColor = 'EF4444';

                slide.addShape(pres.ShapeType.rect, {
                    x: x, y: y, w: w, h: toInchDim(8),
                    fill: { color: stripColor },
                    line: { color: stripColor, width: 0 }
                });

                // Avatar / Icon
                const imgSize = toInchDim(48);
                const textStartX = x + toInchDim(16);
                let textOffsetX = 0;

                if (node.data.image) {
                    slide.addImage({
                        path: node.data.image,
                        x: textStartX,
                        y: y + toInchDim(20),
                        w: imgSize,
                        h: imgSize,
                        rounding: true
                    });
                    textOffsetX = imgSize + toInchDim(12);
                } else {
                    // Placeholder Circle
                    slide.addShape(pres.ShapeType.ellipse, {
                        x: textStartX,
                        y: y + toInchDim(20),
                        w: imgSize,
                        h: imgSize,
                        fill: { color: 'F3F4F6' }, // gray-100
                        line: { color: 'E5E7EB', width: 1 }
                    });
                    textOffsetX = imgSize + toInchDim(12);
                }

                // Name
                slide.addText(node.data.label || 'Name', {
                    x: textStartX + textOffsetX,
                    y: y + toInchDim(20),
                    w: w - toInchDim(32) - textOffsetX,
                    h: toInchDim(24),
                    fontFace: 'Arial',
                    fontSize: 14,
                    bold: true,
                    color: '1F2937',
                    align: 'left',
                    valign: 'middle'
                });

                // Role
                slide.addText(node.data.role || 'Role', {
                    x: textStartX + textOffsetX,
                    y: y + toInchDim(44),
                    w: w - toInchDim(32) - textOffsetX,
                    h: toInchDim(20),
                    fontFace: 'Arial',
                    fontSize: 11,
                    color: '6B7280',
                    align: 'left',
                    valign: 'middle'
                });

                // Department
                if (node.data.department) {
                    slide.addText(node.data.department, {
                        x: textStartX,
                        y: y + h - toInchDim(30),
                        w: w - toInchDim(32),
                        h: toInchDim(20),
                        fontFace: 'Arial',
                        fontSize: 10,
                        color: '9CA3AF',
                        align: 'left',
                        valign: 'middle'
                    });
                }
            }
            else if (node.type === 'text') {
                const w = toInchDim(node.width || 150);
                const h = toInchDim(node.height || 50);

                slide.addText(node.data.label || 'Text', {
                    x: x, y: y, w: w, h: h,
                    fontFace: 'Arial',
                    fontSize: parseInt(node.data.fontSize) || 14,
                    bold: node.data.isBold,
                    italic: node.data.isItalic,
                    color: (node.data.textColor || '#1f2937').replace('#', ''),
                    fill: { color: 'FFFFFF', transparency: 100 },
                    align: 'left',
                    valign: 'top'
                });
            }
        });

        // 4. Draw Connectors
        edges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return;

            const sX = toInchX(sourceNode.position.x + (sourceNode.width || 256) / 2);
            const sY = toInchY(sourceNode.position.y + (sourceNode.height || 160));
            const tX = toInchX(targetNode.position.x + (targetNode.width || 256) / 2);
            const tY = toInchY(targetNode.position.y);

            const isDotted = edge.style?.strokeDasharray;
            const lineColor = '9CA3AF';
            const lineWidth = 1.5;

            // Check connector type
            const isStraight = settings?.edgeType === 'straight';

            if (isStraight) {
                // Direct Line
                const x = Math.min(sX, tX);
                const y = Math.min(sY, tY);
                const w = Math.abs(tX - sX);
                const h = Math.abs(tY - sY);

                let flipH = false;
                let flipV = false;
                const dx = tX - sX;
                const dy = tY - sY;
                if ((dx > 0 && dy < 0) || (dx < 0 && dy > 0)) {
                    flipV = true;
                }

                slide.addShape(pres.ShapeType.line, {
                    x: x, y: y, w: w, h: h,
                    line: { color: lineColor, width: lineWidth, dashType: isDotted ? 'dash' : 'solid' },
                    flipH: flipH, flipV: flipV
                });
            } else {
                // Orthogonal (Elbow) - 3 segments
                const midY = (sY + tY) / 2;

                // Segment 1: sX,sY -> sX,midY
                slide.addShape(pres.ShapeType.line, {
                    x: sX, y: Math.min(sY, midY), w: 0, h: Math.abs(midY - sY),
                    line: { color: lineColor, width: lineWidth, dashType: isDotted ? 'dash' : 'solid' }
                });

                // Segment 2: sX,midY -> tX,midY
                slide.addShape(pres.ShapeType.line, {
                    x: Math.min(sX, tX), y: midY, w: Math.abs(tX - sX), h: 0,
                    line: { color: lineColor, width: lineWidth, dashType: isDotted ? 'dash' : 'solid' }
                });

                // Segment 3: tX,midY -> tX,tY
                slide.addShape(pres.ShapeType.line, {
                    x: tX, y: Math.min(midY, tY), w: 0, h: Math.abs(tY - midY),
                    line: { color: lineColor, width: lineWidth, dashType: isDotted ? 'dash' : 'solid' }
                });
            }
        });

        // 5. Save
        console.log("Writing PPTX file...");
        await pres.writeFile({ fileName: `OrgChart_${new Date().toISOString().slice(0, 10)}.pptx` });
        console.log("PPTX export complete.");
    } catch (error) {
        console.error("Failed to export PPTX:", error);
        alert("Failed to export PPTX. Check console for details.");
    }
};
