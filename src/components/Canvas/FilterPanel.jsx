import React, { useMemo } from 'react';
import useStore from '../../store';
import { Filter, X } from 'lucide-react';

const FilterPanel = () => {
    const { nodes, filterState, setFilter, clearFilter } = useStore();

    // Extract unique values for filters
    const options = useMemo(() => {
        const depts = new Set();
        const locs = new Set();
        const types = new Set();

        nodes.forEach(node => {
            if (node.data) {
                if (node.data.department) depts.add(node.data.department);
                if (node.data.employeeType) types.add(node.data.employeeType);

                // Check teamType for regions/locations
                if (node.data.teamType && Array.isArray(node.data.teamType.regions)) {
                    node.data.teamType.regions.forEach(r => locs.add(r));
                }
            }
        });

        return {
            departments: Array.from(depts).sort(),
            locations: Array.from(locs).sort(),
            types: Array.from(types).sort()
        };
    }, [nodes]);

    const handleFilterChange = (field, value) => {
        if (!value) {
            clearFilter();
        } else {
            setFilter('CRITERIA', { field, value });
        }
    };

    const isActive = filterState.type !== 'NONE';

    return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 w-64 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Filter size={16} />
                    Filters
                </div>
                {isActive && (
                    <button
                        onClick={clearFilter}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                        <X size={12} />
                        Clear
                    </button>
                )}
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Department</label>
                <select
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    value={filterState.type === 'CRITERIA' && filterState.value.field === 'department' ? filterState.value.value : ''}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                    <option value="">All Departments</option>
                    {options.departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Location Filter */}
            {options.locations.length > 0 && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Location / Region</label>
                    <select
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                        value={filterState.type === 'CRITERIA' && filterState.value.field === 'region' ? filterState.value.value : ''}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                    >
                        <option value="">All Locations</option>
                        {options.locations.map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Employee Type Filter */}
            {options.types.length > 0 && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Employee Type</label>
                    <select
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                        value={filterState.type === 'CRITERIA' && filterState.value.field === 'employeeType' ? filterState.value.value : ''}
                        onChange={(e) => handleFilterChange('employeeType', e.target.value)}
                    >
                        <option value="">All Types</option>
                        {options.types.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            )}

            {filterState.type === 'SUBTREE' && (
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 border border-blue-100">
                    Viewing subtree focus. <button onClick={clearFilter} className="underline font-medium">Clear</button>
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
