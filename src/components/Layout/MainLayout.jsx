import React, { useState } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import TopToolbar from './TopToolbar';
import { Menu, X } from 'lucide-react';
import useStore from '../../store/useStore';

const MainLayout = ({ children }) => {
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);

    // Lifted state for Overlays (passed to TopToolbar and Children)
    const [activeOverlay, setActiveOverlay] = useState(null);
    const { nodes, setNodes } = useStore();

    const handleOverlayChange = (overlayType) => {
        if (activeOverlay === overlayType) {
            setActiveOverlay(null);
            // Reset nodes
            setNodes(nodes.map(n => ({
                ...n,
                data: { ...n.data, badges: [], overlay: null }
            })));
            return;
        }

        setActiveOverlay(overlayType);

        // Apply mock overlay data
        const newNodes = nodes.map(node => {
            let badges = [];
            let overlay = null;

            if (overlayType === 'scrum') {
                // Real logic: Assign color based on selected Scrum Team
                const team = node.data.teamType?.scrum;
                if (team) {
                    const teamColors = {
                        'Team A': '#3b82f6', // Blue
                        'Team B': '#10b981', // Green
                        'Team C': '#8b5cf6'  // Purple
                    };
                    if (teamColors[team]) {
                        badges = [teamColors[team]];
                        overlay = 'scrum';
                    }
                }
            }

            return {
                ...node,
                data: { ...node.data, badges, overlay }
            };
        });

        setNodes(newNodes);
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
            {/* Top Toolbar */}
            <TopToolbar
                activeOverlay={activeOverlay}
                onToggleOverlay={handleOverlayChange}
                showRightPanel={showRightPanel}
                onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Mobile Toggle Buttons (Visible only on small screens) */}
                <div className="fixed top-20 left-4 z-50 md:hidden">
                    <button
                        onClick={() => setShowLeftPanel(!showLeftPanel)}
                        className="p-2 bg-white rounded-md shadow-md border border-gray-200 text-gray-600"
                    >
                        {showLeftPanel ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Left Panel */}
                <div className={`
                    fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                    ${showLeftPanel ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <LeftPanel />
                </div>

                {/* Main Content (Canvas) */}
                <main className="flex-1 relative h-full w-full overflow-hidden">
                    {children}
                </main>

                {/* Right Panel */}
                <div className={`
                    fixed inset-y-0 right-0 z-40 transform transition-all duration-300 ease-in-out 
                    md:relative md:translate-x-0
                    ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}
                    ${showRightPanel ? 'md:w-80' : 'md:w-0'}
                `}>
                    <div className="w-80 h-full overflow-hidden">
                        <RightPanel />
                    </div>
                </div>

                {/* Mobile Overlay for Panels */}
                {(showLeftPanel || showRightPanel) && (
                    <div
                        className="fixed inset-0 bg-black/20 z-30 md:hidden"
                        onClick={() => {
                            setShowLeftPanel(false);
                            setShowRightPanel(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default MainLayout;
