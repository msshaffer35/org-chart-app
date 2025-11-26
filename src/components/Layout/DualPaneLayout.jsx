import React from 'react';
import { ReactFlowProvider } from 'reactflow';

/**
 * DualPaneLayout - Reusable split-view layout for comparison modes
 *
 * Provides a 50/50 split layout with React Flow providers for each pane.
 * Used by both Comparison mode and Side-by-Side View mode.
 *
 * @param {ReactNode} leftPane - Content for left pane (typically a canvas)
 * @param {ReactNode} rightPane - Content for right pane (typically a canvas)
 * @param {string} dividerColor - Tailwind color for the vertical divider (default: 'slate-200')
 */
const DualPaneLayout = ({ leftPane, rightPane, dividerColor = 'slate-200' }) => {
    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Left Pane */}
            <div className="w-1/2 h-full relative">
                <ReactFlowProvider>
                    {leftPane}
                </ReactFlowProvider>
            </div>

            {/* Right Pane */}
            <div className={`w-1/2 h-full relative border-l-4 border-${dividerColor}`}>
                <ReactFlowProvider>
                    {rightPane}
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default DualPaneLayout;
