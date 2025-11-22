import React from 'react';
import { Settings, Sliders } from 'lucide-react';
import useStore from '../../store/useStore';

const RightPanel = () => {
    const nodes = useStore((state) => state.nodes);
    const settings = useStore((state) => state.settings);
    const updateSettings = useStore((state) => state.updateSettings);
    const updateNodeData = useStore((state) => state.updateNodeData);

    const selectedNode = nodes.find((n) => n.selected);

    return (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full z-10 shadow-sm overflow-y-auto">
            {selectedNode ? (
                // Node Properties
                <div className="flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Settings size={18} />
                            Node Properties
                        </h2>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={selectedNode.data.label}
                                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={selectedNode.data.role}
                                    onChange={(e) => updateNodeData(selectedNode.id, { role: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={selectedNode.data.department}
                                    onChange={(e) => updateNodeData(selectedNode.id, { department: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Styling */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Header Color</label>
                            <div className="flex flex-wrap gap-2">
                                {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-gray-500'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateNodeData(selectedNode.id, { color })}
                                        className={`w-8 h-8 rounded-full ${color} ${selectedNode.data.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Chart Settings
                <div className="flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Sliders size={18} />
                            Chart Settings
                        </h2>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Spacing */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Node Spacing</label>
                                <span className="text-xs text-gray-500">{settings.spacing}px</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="300"
                                step="10"
                                value={settings.spacing}
                                onChange={(e) => updateSettings({ spacing: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Line Style */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Style</label>
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                <button
                                    onClick={() => updateSettings({ edgeType: 'smoothstep' })}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${settings.edgeType === 'smoothstep' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Curved
                                </button>
                                <button
                                    onClick={() => updateSettings({ edgeType: 'step' })}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${settings.edgeType === 'step' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Step
                                </button>
                                <button
                                    onClick={() => updateSettings({ edgeType: 'straight' })}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${settings.edgeType === 'straight' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Straight
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default RightPanel;
