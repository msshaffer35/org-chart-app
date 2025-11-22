import React from 'react';
import { Settings, Sliders, ArrowDown, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';

const RightPanel = () => {
    const layoutNodes = useStore((state) => state.layoutNodes);

    return (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full z-10 shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                <Settings size={18} className="text-gray-500" />
                <h2 className="font-semibold text-gray-700">Properties</h2>
            </div>

            <div className="p-4 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Layout</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => layoutNodes('TB')}
                        className="flex-1 flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                    >
                        <ArrowDown size={20} className="text-gray-600 mb-1" />
                        <span className="text-xs font-medium text-gray-600">Vertical</span>
                    </button>
                    <button
                        onClick={() => layoutNodes('LR')}
                        className="flex-1 flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                    >
                        <ArrowRight size={20} className="text-gray-600 mb-1" />
                        <span className="text-xs font-medium text-gray-600">Horizontal</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Sliders size={24} className="text-gray-300" />
                </div>
                <p className="text-sm">Select a node to view and edit its properties.</p>
            </div>
        </aside>
    );
};

export default RightPanel;
