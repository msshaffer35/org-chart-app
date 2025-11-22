import React from 'react';
import { Layers, ArrowDown, ArrowRight, Settings, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';

const TopToolbar = ({ activeOverlay, onToggleOverlay }) => {
    const layoutNodes = useStore((state) => state.layoutNodes);
    const deleteNode = useStore((state) => state.deleteNode);
    const nodes = useStore((state) => state.nodes);

    // Find selected node
    const selectedNode = nodes.find(n => n.selected);

    const handleDelete = () => {
        if (selectedNode) {
            if (window.confirm(`Delete "${selectedNode.data.label}" and all its reports?`)) {
                deleteNode(selectedNode.id);
            }
        }
    };

    return (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm z-20">
            <div className="flex items-center gap-4">
                {/* Layout Controls */}
                <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</span>
                    <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                        <button
                            onClick={() => layoutNodes('TB')}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"
                            title="Vertical Layout"
                        >
                            <ArrowDown size={16} />
                        </button>
                        <button
                            onClick={() => layoutNodes('LR')}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-600"
                            title="Horizontal Layout"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Overlay Controls */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overlays</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleOverlay('skills')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay === 'skills'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            Skills Gaps
                        </button>
                        <button
                            onClick={() => onToggleOverlay('scrum')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay === 'scrum'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            Scrum Teams
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
                {selectedNode && (
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Selected Node"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
};

export default TopToolbar;
