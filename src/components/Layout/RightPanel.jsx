import React from 'react';
import { Settings, Sliders, ArrowDown, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';

const RightPanel = () => {
    const layoutNodes = useStore((state) => state.layoutNodes);

    return (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full z-10 shadow-sm">
            {/* Content will go here later */}
        </aside>
    );
};

export default RightPanel;
