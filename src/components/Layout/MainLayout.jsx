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
    const [activeOverlays, setActiveOverlays] = useState([]);
    const { nodes, setNodes } = useStore();

    const handleOverlayChange = (overlayType) => {
        let newOverlays;
        if (activeOverlays.includes(overlayType)) {
            newOverlays = activeOverlays.filter(o => o !== overlayType);
        } else {
            newOverlays = [...activeOverlays, overlayType];
        }
        setActiveOverlays(newOverlays);

        // Apply overlay data
        const newNodes = nodes.map(node => {
            let badges = [];
            let overlayFields = [];

            // Scrum Overlay
            if (newOverlays.includes('scrum')) {
                const team = node.data.teamType?.scrum;
                if (team) {
                    const teamColors = {
                        'Team A': '#3b82f6', // Blue
                        'Team B': '#10b981', // Green
                        'Team C': '#8b5cf6'  // Purple
                    };
                    if (teamColors[team]) {
                        badges.push({ color: teamColors[team], title: `Scrum: ${team}` });
                        overlayFields.push({ label: 'Scrum Team', value: team, color: teamColors[team] });
                    }
                }
            }

            // CoE Overlay
            if (newOverlays.includes('coe')) {
                const coe = node.data.teamType?.coe;
                if (coe) {
                    const coeColors = {
                        'Digital': '#ec4899', // Pink
                        'AI': '#8b5cf6',      // Violet
                        'Data': '#f59e0b'     // Amber
                    };
                    if (coeColors[coe]) {
                        badges.push({ color: coeColors[coe], title: `CoE: ${coe}` });
                        overlayFields.push({ label: 'CoE', value: coe, color: coeColors[coe] });
                    }
                }
            }

            // Regions Overlay
            if (newOverlays.includes('regions')) {
                const regions = node.data.teamType?.regions || [];
                const regionColors = {
                    'US': '#3b82f6',     // Blue
                    'Global': '#10b981', // Green
                    'EMEA': '#f97316',   // Orange
                    'APAC': '#ef4444'    // Red
                };

                // For badges, we show all dots
                regions.forEach(region => {
                    if (regionColors[region]) {
                        badges.push({ color: regionColors[region], title: `Region: ${region}` });
                    }
                });

                // For text, we show a comma-separated list
                if (regions.length > 0) {
                    overlayFields.push({
                        label: 'Regions',
                        value: regions.join(', '),
                        color: '#6b7280' // Gray for text label since it can be multiple colors
                    });
                }
            }

            return {
                ...node,
                data: { ...node.data, badges, overlayFields }
            };
        });

        setNodes(newNodes);
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
            {/* Top Toolbar */}
            <TopToolbar
                activeOverlay={activeOverlays}
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
