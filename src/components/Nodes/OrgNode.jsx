import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Briefcase, Building, Plus } from 'lucide-react';
import useStore from '../../store/useStore';

const OrgNode = ({ id, data, selected }) => {
    const updateNodeData = useStore((state) => state.updateNodeData);
    const addReport = useStore((state) => state.addReport);

    const [isEditingName, setIsEditingName] = React.useState(false);
    const [isEditingRole, setIsEditingRole] = React.useState(false);
    const [name, setName] = React.useState(data.label);
    const [role, setRole] = React.useState(data.role);

    // Sync local state if props change (e.g. from undo/redo or external update)
    React.useEffect(() => {
        setName(data.label);
        setRole(data.role);
    }, [data.label, data.role]);

    const handleNameSubmit = () => {
        setIsEditingName(false);
        if (name !== data.label) {
            updateNodeData(id, { label: name });
        }
    };

    const handleRoleSubmit = () => {
        setIsEditingRole(false);
        if (role !== data.role) {
            updateNodeData(id, { role: role });
        }
    };

    const handleKeyDown = (e, submitFn) => {
        if (e.key === 'Enter') {
            submitFn();
        }
    };

    return (
        <div className={`
            group relative w-64 bg-white rounded-lg shadow-lg border transition-all duration-200
            ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:shadow-xl'}
        `}>
            {/* Header / Color Strip */}
            <div className={`h-2 w-full rounded-t-lg ${data.color || 'bg-blue-500'}`} />

            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {data.image ? (
                            <img src={data.image} alt={data.label} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-gray-400" />
                        )}
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 min-w-0">
                        {isEditingName ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleNameSubmit}
                                onKeyDown={(e) => handleKeyDown(e, handleNameSubmit)}
                                autoFocus
                                className="w-full font-bold text-gray-800 text-sm border-b border-blue-500 outline-none bg-transparent p-0"
                            />
                        ) : (
                            <h3
                                className="font-bold text-gray-800 text-sm truncate cursor-text hover:bg-gray-50 rounded px-1 -ml-1"
                                onClick={() => setIsEditingName(true)}
                            >
                                {data.label}
                            </h3>
                        )}

                        <div className="flex items-center text-gray-500 mt-0.5">
                            <Briefcase className="w-3 h-3 mr-1 shrink-0" />
                            {isEditingRole ? (
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    onBlur={handleRoleSubmit}
                                    onKeyDown={(e) => handleKeyDown(e, handleRoleSubmit)}
                                    autoFocus
                                    className="w-full text-xs border-b border-blue-500 outline-none bg-transparent p-0"
                                />
                            ) : (
                                <p
                                    className="text-xs truncate cursor-text hover:bg-gray-50 rounded px-1 -ml-1"
                                    onClick={() => setIsEditingRole(true)}
                                >
                                    {data.role || 'Employee'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Department / Meta */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                        <Building className="w-3 h-3 mr-1" />
                        {data.department || 'General'}
                    </div>
                    {/* Overlay Badges */}
                    {data.badges && (
                        <div className="flex space-x-1">
                            {data.badges.map((badge, idx) => (
                                <span key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: badge }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Report Button (Visible on Hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent node selection
                    addReport(id);
                }}
                className="
                    absolute -bottom-3 left-1/2 transform -translate-x-1/2
                    w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:bg-blue-600 hover:scale-110
                    z-10
                "
                title="Add Direct Report"
            >
                <Plus size={14} />
            </button>

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400 !opacity-0" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400 !opacity-0" />
        </div>
    );
};

export default memo(OrgNode);
