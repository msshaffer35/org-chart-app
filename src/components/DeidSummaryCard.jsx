import React, { useState } from 'react';
import { Users, Briefcase, MapPin, Layers, ChevronDown, ChevronUp, PieChart } from 'lucide-react';

const ProgressBar = ({ label, count, total, color = "bg-blue-500" }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 truncate pr-2" title={label}>{label}</span>
                <span className="font-medium text-gray-700">{count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const CategorySection = ({ title, icon: Icon, data, total }) => {
    const [isOpen, setIsOpen] = useState(false);
    const items = Object.entries(data || {});

    if (items.length === 0) return null;

    // Sort by count descending
    const sortedItems = items.sort(([, a], [, b]) => b - a);
    const topItems = sortedItems.slice(0, 3);

    return (
        <div className="border-b border-gray-100 last:border-0 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-xs font-medium text-gray-700 hover:bg-gray-50 p-1 rounded transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-400" />
                    <span>{title}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <span className="text-[10px]">{items.length} types</span>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </button>

            {isOpen && (
                <div className="mt-2 pl-2 pr-1 space-y-1">
                    {sortedItems.map(([label, count]) => (
                        <ProgressBar
                            key={label}
                            label={label}
                            count={count}
                            total={total}
                        />
                    ))}
                </div>
            )}

            {!isOpen && (
                <div className="mt-1 pl-6 text-[10px] text-gray-500 truncate">
                    {topItems.map(([label, count]) => `${label} (${count})`).join(', ')}
                    {items.length > 3 && ` +${items.length - 3} more`}
                </div>
            )}
        </div>
    );
};

const DeidSummaryCard = ({ summary }) => {
    if (!summary || summary.count === 0) return null;

    const { metadata } = summary;
    const totalCount = summary.count;

    return (
        <div className="mt-3 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-600" />
                    <span className="font-semibold text-xs text-gray-700">
                        {totalCount} Descendants
                    </span>
                </div>
                <PieChart size={14} className="text-gray-400" />
            </div>

            {/* Content */}
            <div className="px-2 py-1">
                <CategorySection
                    title="Employee Types"
                    icon={Users}
                    data={metadata.employeeTypes}
                    total={totalCount}
                />

                <CategorySection
                    title="Departments & Teams"
                    icon={Layers}
                    data={{ ...metadata.coes, ...metadata.scrumTeams }}
                    total={totalCount}
                />

                <CategorySection
                    title="Functions"
                    icon={Briefcase}
                    data={metadata.functions}
                    total={totalCount}
                />

                <CategorySection
                    title="Locations"
                    icon={MapPin}
                    data={metadata.regions}
                    total={totalCount}
                />
            </div>
        </div>
    );
};

export default DeidSummaryCard;
