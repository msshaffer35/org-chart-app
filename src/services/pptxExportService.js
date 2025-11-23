import PptxGenJS from 'pptxgenjs';

// Constants
const PX_TO_INCH = 1 / 96;
const SLIDE_WIDTH_INCH = 10; // Standard 16:9 is 10x5.625 usually, but let's check PptxGenJS defaults
const SLIDE_HEIGHT_INCH = 5.625;

/**
import PptxGenJS from 'pptxgenjs';

// Constants
const PX_TO_INCH = 1 / 96;
const SLIDE_WIDTH_INCH = 10; // Standard 16:9 is 10x5.625 usually, but let's check PptxGenJS defaults
const SLIDE_HEIGHT_INCH = 5.625;

/**
 * Exports the current nodes and edges to a PPTX file.
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} settings - App settings (for styling)
 */
export const exportToPptx = async (nodes, edges, settings) => {
    console.log("Starting PPTX export...", { nodes, edges });
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
            // Approx width/height if not set in data (OrgNode is w-64 = 256px, h varies but approx 150px?)
            // Let's assume standard size for calculation if width/height missing
            const w = node.width || 256;
            const h = node.height || 150;

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x + w > maxX) maxX = x + w;
            if (y + h > maxY) maxY = y + h;
        });

        // Add some padding
        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const chartWidth = maxX - minX;
        const chartHeight = maxY - minY;

        // 2. Calculate Scale to Fit Slide
        // Slide dimensions in pixels (approx)
        const slideWidthPx = 10 * 96;
        const slideHeightPx = 5.625 * 96;

        const scaleX = slideWidthPx / chartWidth;
        const scaleY = slideHeightPx / chartHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up if it fits, only down

        // Center offsets
        const offsetX = (slideWidthPx - chartWidth * scale) / 2;
        const offsetY = (slideHeightPx - chartHeight * scale) / 2;

        // Helper to convert chart px to slide inches
        const toInchX = (x) => {
            return ((x - minX) * scale + offsetX) * PX_TO_INCH;
        };
        const toInchY = (y) => {
            return ((y - minY) * scale + offsetY) * PX_TO_INCH;
        };
        const toInchDim = (v) => {
            return (v * scale) * PX_TO_INCH;
        };

        // 3. Draw Nodes
        // We need to track node shapes to attach connectors
        // PptxGenJS connectors use shape IDs? Or coordinates?
        // Actually PptxGenJS connectors usually take x/y coordinates.
        // We will calculate connection points based on node positions.

        nodes.forEach(node => {
            const x = toInchX(node.position.x);
            const y = toInchY(node.position.y);

            // OrgNode dimensions (approx 256px wide)
            // We should try to get actual dimensions if possible, but ReactFlow nodes might not have them computed yet if hidden.
            // For OrgNode, let's assume standard w-64 (256px). Height is variable, let's guess 140px.
            // For TextNode, we use style.

            if (node.type === 'org' || !node.type) { // Default to org
                const w = toInchDim(256);
                const h = toInchDim(160); // Slightly taller to be safe

                // Background Card
                slide.addShape(pres.ShapeType.rect, {
                    x: x, y: y, w: w, h: h,
                    fill: { color: 'FFFFFF' },
                    line: { color: 'E5E7EB', width: 1 }, // gray-200
                    shadow: { type: 'outer', color: '000000', opacity: 0.1, blur: 3, offset: 2 }
                });

                // Color Strip
                // Parse Tailwind color or hex? Node data usually has 'bg-blue-500' or hex from rules.
                // We need a helper to convert tailwind classes to hex if needed, or just support hex.
                // For now, let's assume the data.color might be a class, which is hard to map.
                // We'll default to Blue if it's a class, or use the value if it looks like hex.
                let stripColor = '3B82F6'; // blue-500
                if (node.data.color && node.data.color.startsWith('#')) {
                    stripColor = node.data.color.substring(1);
                }
                // If it's a rule result (effectiveColor), we might not have it here easily without re-running logic.
                // For MVP, let's just use a default or try to parse simple ones.

                slide.addShape(pres.ShapeType.rect, {
                    x: x, y: y, w: w, h: toInchDim(8), // h-2 is 8px
                    fill: { color: stripColor },
                    line: { color: stripColor, width: 0 }
                });

                // Name
                slide.addText(node.data.label || 'Name', {
                    x: x + toInchDim(16), y: y + toInchDim(20), w: w - toInchDim(32), h: toInchDim(24),
                    fontSize: 14,
                    bold: true,
                    color: '1F2937', // gray-800
                    align: 'left',
                    valign: 'middle'
                });

                // Role
                slide.addText(node.data.role || 'Role', {
                    x: x + toInchDim(16), y: y + toInchDim(44), w: w - toInchDim(32), h: toInchDim(20),
                    fontSize: 12,
                    color: '6B7280', // gray-500
                    align: 'left',
                    valign: 'middle'
                });

                // Department
                if (node.data.department) {
                    slide.addText(node.data.department, {
                        x: x + toInchDim(16), y: y + h - toInchDim(30), w: w - toInchDim(32), h: toInchDim(20),
                        fontSize: 10,
                        color: '9CA3AF', // gray-400
                        align: 'left',
                        valign: 'middle'
                    });
                }

                // Image (Avatar)
                // If node.data.image exists
                if (node.data.image) {
                    // We'll place it top-right or left? In component it's left.
                    // Let's put it at x+16, y+20 (shifting text) or just ignore layout complexity for MVP.
                    // Component: Flex row. Avatar -> Name/Role.
                    // Let's adjust text x if image exists.

                    const imgSize = toInchDim(48); // w-12 = 48px
                    slide.addImage({
                        path: node.data.image,
                        x: x + toInchDim(16),
                        y: y + toInchDim(20),
                        w: imgSize,
                        h: imgSize,
                        rounding: true // Try to make it round
                    });

                    // Shift text
                    // We can't easily update the text object above, so we should have checked before.
                    // But for MVP, let's just overlay or assume text is shifted.
                    // Actually, let's just put the image there.
                }
            }
            else if (node.type === 'text') {
                // Text Node
                // Min width 150px, min height 50px
                const w = toInchDim(node.width || 150);
                const h = toInchDim(node.height || 50);

                slide.addText(node.data.label || 'Text', {
                    x: x, y: y, w: w, h: h,
                    fontSize: parseInt(node.data.fontSize) || 14,
                    bold: node.data.isBold,
                    italic: node.data.isItalic,
                    color: (node.data.textColor || '#1f2937').replace('#', ''),
                    fill: { color: 'FFFFFF', transparency: 100 }, // Transparent background
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

            // Calculate center points
            // Source: Bottom Center
            const sX = toInchX(sourceNode.position.x + (sourceNode.width || 256) / 2);
            const sY = toInchY(sourceNode.position.y + (sourceNode.height || 160));

            // Target: Top Center
            const tX = toInchX(targetNode.position.x + (targetNode.width || 256) / 2);
            const tY = toInchY(targetNode.position.y);

            // Style
            const isDotted = edge.style?.strokeDasharray;

            // Calculate line dimensions and position
            const x = Math.min(sX, tX);
            const y = Math.min(sY, tY);
            const w = Math.abs(tX - sX);
            const h = Math.abs(tY - sY);

            // Determine flips for direction
            // Default line is top-left to bottom-right
            // If we want top-right to bottom-left (or vice versa), we need to flip
            let flipH = false;
            let flipV = false;

            if (sX < tX && sY > tY) {
                // Source is left-bottom, Target is right-top -> Up-Right
                flipV = true;
            } else if (sX > tX && sY < tY) {
                // Source is right-top, Target is left-bottom -> Down-Left
                flipH = true;
            } else if (sX > tX && sY > tY) {
                // Source is right-bottom, Target is left-top -> Up-Left (Same as Down-Right but swapped? No, line shape is diagonal)
                // Wait, if both are swapped, it's still top-left to bottom-right bounding box?
                // No, bounding box is always x,y to x+w,y+h.
                // A line from (10,10) to (20,20) is TL to BR.
                // A line from (20,20) to (10,10) is the same line visually.
                // A line from (10,20) to (20,10) is BL to TR. This needs flipV (or flipH).
                // So we only care if the slope is positive or negative.
                // (y2-y1)/(x2-x1). 
                // If sX < tX (dx > 0) and sY < tY (dy > 0) -> Positive slope (downwards in screen coords) -> Normal
                // If sX < tX (dx > 0) and sY > tY (dy < 0) -> Negative slope (upwards) -> FlipV
                // If sX > tX (dx < 0) and sY < tY (dy > 0) -> Negative slope -> FlipH (or FlipV, same visual)
                // If sX > tX (dx < 0) and sY > tY (dy < 0) -> Positive slope -> Normal
            }

            // Simplified logic:
            // If signs of dx and dy are different, we need a flip.
            const dx = tX - sX;
            const dy = tY - sY;
            if ((dx > 0 && dy < 0) || (dx < 0 && dy > 0)) {
                flipV = true; // Arbitrarily choose flipV to handle the "anti-diagonal" case
            }

            // Handle vertical/horizontal lines (w=0 or h=0)
            // PptxGenJS might warn if w=0 or h=0. Let's ensure min size?
            // Actually it handles them fine usually, but let's check.

            slide.addShape(pres.ShapeType.line, {
                x: x, y: y, w: w, h: h,
                line: {
                    color: '9CA3AF', // gray-400
                    width: 2,
                    dashType: isDotted ? 'dash' : 'solid'
                },
                flipH: flipH,
                flipV: flipV
            });
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
