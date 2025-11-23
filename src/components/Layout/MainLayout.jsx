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
                        overlayFields.push({ label: 'CoE', value: coe, color: coeColors[coe] });
                    }
                }
            }

            // Regions Overlay
            if (newOverlays.includes('regions')) {
                const regions = node.data.teamType?.regions || [];

                // For text, we show a comma-separated list
                if (regions.length > 0) {
                    overlayFields.push({
                        label: 'Regions',
                        value: regions.join(', '),
                        color: '#6b7280' // Gray for text label since it can be multiple colors
                    });
                }
            }

            // Function Overlay
            if (newOverlays.includes('function')) {
                const functions = node.data.teamType?.functions || [];
                if (functions.length > 0) {
                    // Use the color of the first function, or a default mix
                    const functionColors = {
                        'HR': '#e879f9',      // Fuchsia
                        'Finance': '#22c55e', // Green
                        'Sales': '#3b82f6',   // Blue
                        'Marketing': '#f97316', // Orange
                        'Other': '#9ca3af'    // Gray
                    };
                    const color = functionColors[functions[0]] || '#6b7280';

                    overlayFields.push({
                        label: 'Function',
                        value: functions.join(', '),
                        color: color
                    });
                }
            }

            // Sub-Function Overlay
            if (newOverlays.includes('subFunction')) {
                const subFunctions = node.data.teamType?.subFunctions || [];
                if (subFunctions.length > 0) {
                    overlayFields.push({
                        label: 'Sub-Function',
                        value: subFunctions.join(', '),
                        color: '#0d9488' // Teal
                    });
                }
            }

            // Employee Type Overlay
            if (newOverlays.includes('employeeType')) {
                const type = node.data.employeeType;
                if (type) {
                    const typeColors = {
                        'Full-time': '#3b82f6',   // Blue
                        'Part-time': '#eab308',   // Yellow
                        'Contractor': '#f97316',  // Orange
                        'Vendor': '#a855f7'       // Purple
                    };
                    if (typeColors[type]) {
                        overlayFields.push({ label: 'Type', value: type, color: typeColors[type] });
                    }
                }
            }

            return {
                ...node,
                data: { ...node.data, overlayFields }
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
