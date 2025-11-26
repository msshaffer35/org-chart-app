import React from 'react';
import { Layers, ArrowDown, ArrowRight, Settings, Trash2, Users } from 'lucide-react';
import useStore from '../../store';

const TopToolbar = ({ activeOverlay, onToggleOverlay, showRightPanel, onToggleRightPanel }) => {
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
                            onClick={() => onToggleOverlay('scrum')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay && activeOverlay.includes('scrum')
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            Scrum Teams
                        </button>
                        <button
                            onClick={() => onToggleOverlay('coe')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay && activeOverlay.includes('coe')
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            CoE
                        </button>
                        <button
                            onClick={() => onToggleOverlay('regions')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay && activeOverlay.includes('regions')
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            Regions
                        </button>
                        <button
                            onClick={() => onToggleOverlay('function')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay && activeOverlay.includes('function')
                                    ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            Function
                        </button>
                        <button
                            onClick={() => onToggleOverlay('subFunction')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay && activeOverlay.includes('subFunction')
                                    ? 'bg-teal-100 text-teal-700 border border-teal-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Layers size={14} />
                            Sub-Function
                        </button>
                        <button
                            onClick={() => onToggleOverlay('employeeType')}
                            className={`
                                px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                                ${activeOverlay && activeOverlay.includes('employeeType')
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            <Users size={14} />
                            Employee Type
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
                <button
                    onClick={onToggleRightPanel}
                    className={`p-2 rounded-full transition-colors ${showRightPanel ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Toggle Properties Panel"
                >
                    <Settings size={20} />
                </button>

            </div>
        </div>
    );
};

export default TopToolbar;
