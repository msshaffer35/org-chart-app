import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Briefcase, Building } from 'lucide-react';

const OrgNode = ({ data }) => {
    return (
        <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            {/* Header / Color Strip */}
            <div className={`h-2 w-full ${data.color || 'bg-blue-500'}`} />

            <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {data.image ? (
                            <img src={data.image} alt={data.label} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-gray-400" />
                        )}
                    </div>

                    {/* Name & Role */}
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">{data.label}</h3>
                        <p className="text-xs text-gray-500 flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {data.role || 'Employee'}
                        </p>
                    </div>
                </div>

                {/* Department / Meta */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                        <Building className="w-3 h-3 mr-1" />
                        {data.department || 'General'}
                    </div>
                    {/* Overlay Badges (Placeholder for now) */}
                    {data.badges && (
                        <div className="flex space-x-1">
                            {data.badges.map((badge, idx) => (
                                <span key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: badge }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
        </div>
    );
};

export default memo(OrgNode);
