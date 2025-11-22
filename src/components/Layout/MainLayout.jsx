import React, { useState } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { Menu, X } from 'lucide-react';

const MainLayout = ({ children }) => {
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            {/* Mobile Toggle Buttons (Visible only on small screens) */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
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
                fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <RightPanel />
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
    );
};

export default MainLayout;
