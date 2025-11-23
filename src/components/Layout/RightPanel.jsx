import React from 'react';
import { Settings, Sliders, Bold, Italic, Type, Palette } from 'lucide-react';
import useStore from '../../store/useStore';

const RightPanel = () => {
    const nodes = useStore((state) => state.nodes);
    const settings = useStore((state) => state.settings);
    const updateSettings = useStore((state) => state.updateSettings);
    const updateNodeData = useStore((state) => state.updateNodeData);
    const updateParentEdgeStyle = useStore((state) => state.updateParentEdgeStyle);

    const selectedNode = nodes.find((n) => n.selected);

    return (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full z-10 shadow-sm overflow-y-auto">
            {selectedNode ? (
                // Node Properties
                <div className="flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Settings size={18} />
                            {selectedNode.type === 'text' ? 'Text Properties' : 'Node Properties'}
                        </h2>
                    </div>

                    <div className="p-4 space-y-6">
                        {selectedNode.type === 'text' ? (
                            /* Text Node Specific Properties */
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Text Content</label>
                                    <textarea
                                        value={selectedNode.data.label}
                                        onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Typography</label>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                                <div className="px-2 text-gray-400">
                                                    <Type size={14} />
                                                </div>
                                                <select
                                                    value={selectedNode.data.fontSize || '14px'}
                                                    onChange={(e) => updateNodeData(selectedNode.id, { fontSize: e.target.value })}
                                                    className="w-full p-1.5 text-sm bg-transparent outline-none border-l border-gray-200"
                                                >
                                                    <option value="12px">Small (12px)</option>
                                                    <option value="14px">Normal (14px)</option>
                                                    <option value="16px">Medium (16px)</option>
                                                    <option value="20px">Large (20px)</option>
                                                    <option value="24px">Extra Large (24px)</option>
                                                    <option value="32px">Huge (32px)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateNodeData(selectedNode.id, { isBold: !selectedNode.data.isBold })}
                                            className={`p-2 rounded border ${selectedNode.data.isBold ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            title="Bold"
                                        >
                                            <Bold size={16} />
                                        </button>
                                        <button
                                            onClick={() => updateNodeData(selectedNode.id, { isItalic: !selectedNode.data.isItalic })}
                                            className={`p-2 rounded border ${selectedNode.data.isItalic ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            title="Italic"
                                        >
                                            <Italic size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Text Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#1f2937', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateNodeData(selectedNode.id, { textColor: color })}
                                                className={`w-6 h-6 rounded-full border border-gray-200 ${selectedNode.data.textColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Standard Node Properties */
                            <>
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

                                {/* Team Types */}
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Team Types</h3>

                                    {/* Scrum Team */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Scrum Team</label>
                                        <select
                                            value={selectedNode.data.teamType?.scrum || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, {
                                                teamType: { ...selectedNode.data.teamType, scrum: e.target.value }
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="">None</option>
                                            <option value="Team A">Team A</option>
                                            <option value="Team B">Team B</option>
                                            <option value="Team C">Team C</option>
                                        </select>
                                    </div>

                                    {/* Center of Excellence */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Center of Excellence</label>
                                        <select
                                            value={selectedNode.data.teamType?.coe || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, {
                                                teamType: { ...selectedNode.data.teamType, coe: e.target.value }
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        >
                                            <option value="">None</option>
                                            <option value="Digital">Digital</option>
                                            <option value="AI">AI</option>
                                            <option value="Data">Data</option>
                                        </select>
                                    </div>

                                    {/* Regions Supported */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">Regions Supported</label>
                                        <div className="space-y-2">
                                            {['US', 'Global', 'EMEA', 'APAC'].map(region => (
                                                <label key={region} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedNode.data.teamType?.regions?.includes(region) || false}
                                                        onChange={(e) => {
                                                            const currentRegions = selectedNode.data.teamType?.regions || [];
                                                            let newRegions;
                                                            if (e.target.checked) {
                                                                newRegions = [...currentRegions, region];
                                                            } else {
                                                                newRegions = currentRegions.filter(r => r !== region);
                                                            }
                                                            updateNodeData(selectedNode.id, {
                                                                teamType: { ...selectedNode.data.teamType, regions: newRegions }
                                                            });
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-600">{region}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Function (Multi-Select) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">Function</label>
                                        <div className="space-y-2">
                                            {['HR', 'Finance', 'Sales', 'Marketing', 'Other'].map(func => (
                                                <label key={func} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedNode.data.teamType?.functions?.includes(func) || false}
                                                        onChange={(e) => {
                                                            const currentFunctions = selectedNode.data.teamType?.functions || [];
                                                            let newFunctions;
                                                            if (e.target.checked) {
                                                                newFunctions = [...currentFunctions, func];
                                                            } else {
                                                                newFunctions = currentFunctions.filter(f => f !== func);
                                                                // Also remove sub-functions related to this function if needed? 
                                                                // For now, we keep it simple and let user manage sub-functions.
                                                            }
                                                            updateNodeData(selectedNode.id, {
                                                                teamType: { ...selectedNode.data.teamType, functions: newFunctions }
                                                            });
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-600">{func}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sub-Function (Dependent Multi-Select) */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">Sub-Function</label>
                                        <div className="space-y-2">
                                            {(() => {
                                                const selectedFunctions = selectedNode.data.teamType?.functions || [];
                                                const subFunctionMapping = {
                                                    'HR': ['People Ops', 'Recruitment', 'Other (HR)'],
                                                    'Finance': ['Corporate', 'Accounting', 'Other (Finance)'],
                                                    'Sales': ['Field', 'HQ Support', 'Other (Sales)'],
                                                    'Marketing': ['B2B', 'Consumer', 'Other (Marketing)']
                                                };

                                                // Collect all available sub-functions based on selected functions
                                                let availableSubFunctions = [];
                                                selectedFunctions.forEach(func => {
                                                    if (subFunctionMapping[func]) {
                                                        availableSubFunctions = [...availableSubFunctions, ...subFunctionMapping[func]];
                                                    } else if (func === 'Other') {
                                                        availableSubFunctions.push('Other');
                                                    }
                                                });

                                                if (availableSubFunctions.length === 0) {
                                                    return <p className="text-xs text-gray-400 italic">Select a Function first</p>;
                                                }

                                                return availableSubFunctions.map(subFunc => (
                                                    <label key={subFunc} className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedNode.data.teamType?.subFunctions?.includes(subFunc) || false}
                                                            onChange={(e) => {
                                                                const currentSubFunctions = selectedNode.data.teamType?.subFunctions || [];
                                                                let newSubFunctions;
                                                                if (e.target.checked) {
                                                                    newSubFunctions = [...currentSubFunctions, subFunc];
                                                                } else {
                                                                    newSubFunctions = currentSubFunctions.filter(sf => sf !== subFunc);
                                                                }
                                                                updateNodeData(selectedNode.id, {
                                                                    teamType: { ...selectedNode.data.teamType, subFunctions: newSubFunctions }
                                                                });
                                                            }}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-600">{subFunc}</span>
                                                    </label>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Styling */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Header Color</label>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-gray-500'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateNodeData(selectedNode.id, { color })}
                                                className={`w-8 h-8 rounded-full ${color} ${selectedNode.data.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            />
                                        ))}
                                    </div>

                                    <label className="block text-xs font-medium text-gray-500 mb-2">Incoming Connection Style</label>
                                    <div className="flex bg-gray-100 p-1 rounded-md">
                                        <button
                                            onClick={() => updateParentEdgeStyle(selectedNode.id, 'solid')}
                                            className="flex-1 py-1.5 text-xs font-medium rounded-sm transition-all bg-white shadow text-gray-800 hover:bg-gray-50"
                                        >
                                            Solid
                                        </button>
                                        <button
                                            onClick={() => updateParentEdgeStyle(selectedNode.id, 'dotted')}
                                            className="flex-1 py-1.5 text-xs font-medium rounded-sm transition-all text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                        >
                                            Dotted
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
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

                        {/* Connection Style */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Type</label>
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

                        {/* Visibility Toggles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visible Fields</label>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.visibleFields?.name ?? true}
                                        onChange={(e) => updateSettings({ visibleFields: { ...settings.visibleFields, name: e.target.checked } })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Show Name</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.visibleFields?.role ?? true}
                                        onChange={(e) => updateSettings({ visibleFields: { ...settings.visibleFields, role: e.target.checked } })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Show Role</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.visibleFields?.department ?? true}
                                        onChange={(e) => updateSettings({ visibleFields: { ...settings.visibleFields, department: e.target.checked } })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Show Department</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.visibleFields?.image ?? true}
                                        onChange={(e) => updateSettings({ visibleFields: { ...settings.visibleFields, image: e.target.checked } })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">Show Image</span>
                                </label>
                            </div>
                        </div>

                        {/* Conditional Formatting */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Conditional Formatting</label>
                                <button
                                    onClick={() => {
                                        const newRule = {
                                            id: Date.now(),
                                            field: 'department',
                                            operator: 'equals',
                                            value: '',
                                            color: 'bg-red-500'
                                        };
                                        updateSettings({ formattingRules: [...(settings.formattingRules || []), newRule] });
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    + Add Rule
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(settings.formattingRules || []).map((rule, index) => (
                                    <div key={rule.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm space-y-2">
                                        <div className="flex gap-2">
                                            <select
                                                value={rule.field}
                                                onChange={(e) => {
                                                    const newRules = [...settings.formattingRules];
                                                    newRules[index].field = e.target.value;
                                                    updateSettings({ formattingRules: newRules });
                                                }}
                                                className="flex-1 p-1 border border-gray-300 rounded text-xs"
                                            >
                                                <option value="department">Department</option>
                                                <option value="role">Role</option>
                                            </select>
                                            <select
                                                value={rule.operator}
                                                onChange={(e) => {
                                                    const newRules = [...settings.formattingRules];
                                                    newRules[index].operator = e.target.value;
                                                    updateSettings({ formattingRules: newRules });
                                                }}
                                                className="w-20 p-1 border border-gray-300 rounded text-xs"
                                            >
                                                <option value="equals">Is</option>
                                                <option value="contains">Contains</option>
                                            </select>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Value..."
                                            value={rule.value}
                                            onChange={(e) => {
                                                const newRules = [...settings.formattingRules];
                                                newRules[index].value = e.target.value;
                                                updateSettings({ formattingRules: newRules });
                                            }}
                                            className="w-full p-1 border border-gray-300 rounded text-xs"
                                        />

                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-1">
                                                {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-gray-500'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            const newRules = [...settings.formattingRules];
                                                            newRules[index].color = color;
                                                            updateSettings({ formattingRules: newRules });
                                                        }}
                                                        className={`w-4 h-4 rounded-full ${color} ${rule.color === color ? 'ring-1 ring-offset-1 ring-gray-400' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newRules = settings.formattingRules.filter((_, i) => i !== index);
                                                    updateSettings({ formattingRules: newRules });
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(settings.formattingRules || []).length === 0 && (
                                    <p className="text-xs text-gray-400 italic text-center py-2">No rules defined</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default RightPanel;
