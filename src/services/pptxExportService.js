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

        // Helper to scale font size
        const scaleFontSize = (px) => Math.max(4, px * 0.75 * scale); // Min 4pt

        // Helper to estimate text height with word wrapping
        const estimateTextHeight = (text, fontSizePt, widthInch) => {
            if (!text) return 0;
            const widthPt = widthInch * 72;
            // Avg char width approx 0.6 of font size for Arial (safer estimate)
            const charWidthPt = fontSizePt * 0.6;

            const words = text.toString().split(/\s+/);
            let currentLineLen = 0;
            let numLines = 1;

            words.forEach((word) => {
                const wordLen = word.length * charWidthPt;

                if (currentLineLen === 0) {
                    // First word on the line
                    currentLineLen = wordLen;
                } else {
                    // Check if word fits
                    // Add approx space width (charWidthPt)
                    if (currentLineLen + charWidthPt + wordLen <= widthPt) {
                        currentLineLen += charWidthPt + wordLen;
                    } else {
                        // Wrap to new line
                        numLines++;
                        currentLineLen = wordLen;
                    }
                }
            });

            // Line height approx 1.25 * fontSize
            const lineHeightInch = (fontSizePt * 1.25) / 72;
            return numLines * lineHeightInch;
        };

        // Store calculated layouts for edges
        const nodeLayouts = new Map();

        // 3. Draw Nodes
        nodes.forEach(node => {
            const x = toInchX(node.position.x);
            const y = toInchY(node.position.y);

            if (node.type === 'org' || !node.type) {
                const w = toInchDim(256);
                // Start with base height, but allow expansion
                let h = toInchDim(node.height || 200);

                const imgSize = toInchDim(48);
                const textStartX = x + toInchDim(16);
                let textOffsetX = 0;
                const contentStartY = y + toInchDim(20);

                if (node.data.image || !node.data.image) { // Always reserve space for avatar/placeholder
                    textOffsetX = imgSize + toInchDim(12);
                }

                const textWidth = w - toInchDim(32) - textOffsetX;

                // --- Dynamic Layout Calculation ---
                let currentY = contentStartY;
                const layoutItems = []; // Store items to draw later

                // Name
                const nameSize = scaleFontSize(14);
                const nameHeight = estimateTextHeight(node.data.label || 'Name', nameSize, textWidth);
                layoutItems.push({ type: 'text', text: node.data.label || 'Name', x: textStartX + textOffsetX, y: currentY, w: textWidth, h: nameHeight, fontSize: nameSize, bold: true, color: '1F2937' });
                currentY += nameHeight + toInchDim(4);

                // Role
                const roleSize = scaleFontSize(12);
                const roleHeight = estimateTextHeight(node.data.role || 'Role', roleSize, textWidth);
                layoutItems.push({ type: 'text', text: node.data.role || 'Role', x: textStartX + textOffsetX, y: currentY, w: textWidth, h: roleHeight, fontSize: roleSize, color: '6B7280' });
                currentY += roleHeight + toInchDim(4);

                // Overlay Fields
                if (node.data.overlayFields && node.data.overlayFields.length > 0) {
                    currentY += toInchDim(4);
                    const fieldSize = scaleFontSize(10);
                    node.data.overlayFields.forEach(field => {
                        const text = `${field.label}: ${field.value}`;
                        const fieldH = estimateTextHeight(text, fieldSize, textWidth);

                        layoutItems.push({
                            type: 'field',
                            label: field.label,
                            value: field.value,
                            color: field.color,
                            x: textStartX + textOffsetX,
                            y: currentY,
                            w: textWidth,
                            h: fieldH,
                            fontSize: fieldSize
                        });
                        currentY += fieldH + toInchDim(2);
                    });
                }

                // Department (at bottom or pushed down)
                const deptSize = scaleFontSize(10);
                const deptHeight = estimateTextHeight(node.data.department, deptSize, w - toInchDim(32));
                currentY += toInchDim(10); // Padding before dept

                // Check if we need to expand the node
                const contentBottom = currentY + deptHeight + toInchDim(10);
                if (contentBottom > y + h) {
                    h = contentBottom - y;
                }

                // Department Y position (align bottom of expanded node)
                const deptY = y + h - deptHeight - toInchDim(10);
                layoutItems.push({ type: 'text', text: node.data.department, x: x + toInchDim(16), y: deptY, w: w - toInchDim(32), h: deptHeight, fontSize: deptSize, color: '9CA3AF' });

                // Store layout for edges
                nodeLayouts.set(node.id, { x, y, w, h });

                // --- Draw Node ---

                // Background Card
                slide.addShape(pres.ShapeType.rect, {
                    x: x, y: y, w: w, h: h,
                    fill: { color: 'FFFFFF' },
                    line: { color: 'E5E7EB', width: 1 * scale },
                    shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 3 * scale, offset: 2 * scale }
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
                if (node.data.image) {
                    slide.addImage({
                        path: node.data.image,
                        x: textStartX,
                        y: contentStartY,
                        w: imgSize,
                        h: imgSize,
                        rounding: true
                    });
                } else {
                    slide.addShape(pres.ShapeType.ellipse, {
                        x: textStartX,
                        y: contentStartY,
                        w: imgSize,
                        h: imgSize,
                        fill: { color: 'F3F4F6' }, // gray-100
                        line: { color: 'E5E7EB', width: 1 * scale }
                    });
                }

                // Draw Text Items
                layoutItems.forEach(item => {
                    if (item.type === 'text') {
                        slide.addText(item.text, {
                            x: item.x, y: item.y, w: item.w, h: item.h,
                            fontFace: 'Arial', fontSize: item.fontSize, bold: item.bold, color: item.color,
                            align: 'left', valign: 'top'
                        });
                    } else if (item.type === 'field') {
                        slide.addText([
                            { text: item.label + ": ", options: { bold: true, color: '6B7280' } },
                            { text: item.value, options: { bold: false, color: item.color || '1F2937' } }
                        ], {
                            x: item.x, y: item.y, w: item.w, h: item.h,
                            fontFace: 'Arial', fontSize: item.fontSize,
                            align: 'left', valign: 'top'
                        });
                    }
                });
            }
            else if (node.type === 'text') {
                const w = toInchDim(node.width || 150);
                const h = toInchDim(node.height || 50);
                const fontSize = scaleFontSize(parseInt(node.data.fontSize) || 14);

                nodeLayouts.set(node.id, { x, y, w, h });

                slide.addText(node.data.label || 'Text', {
                    x: x, y: y, w: w, h: h,
                    fontFace: 'Arial',
                    fontSize: fontSize,
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

            const sLayout = nodeLayouts.get(sourceNode.id);
            const tLayout = nodeLayouts.get(targetNode.id);

            if (!sLayout || !tLayout) return;

            const sX = sLayout.x + sLayout.w / 2;
            const sY = sLayout.y + sLayout.h; // Bottom of source
            const tX = tLayout.x + tLayout.w / 2;
            const tY = tLayout.y; // Top of target

            const isDotted = edge.style?.strokeDasharray;
            const lineColor = '9CA3AF';
            const lineWidth = 1.5 * scale;

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
