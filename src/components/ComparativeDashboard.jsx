import React, { useState, useEffect } from 'react';
import { metricCalculationService } from '../services/metricCalculationService';
import { benchmarkService } from '../services/benchmarkService';
import { storageService } from '../services/storageService';
import { BarChart2, TrendingUp, Users, Layers, PieChart } from 'lucide-react';

const ComparativeDashboard = ({ baseId, targetId }) => {
    const [metrics, setMetrics] = useState({ base: null, target: null });
    const [loading, setLoading] = useState(true);
    const [selectedBenchmark, setSelectedBenchmark] = useState('tech_series_a');

    const benchmarks = benchmarkService.getBenchmarks();
    const currentBenchmark = benchmarkService.getBenchmark(selectedBenchmark);

    useEffect(() => {
        const loadMetrics = async () => {
            setLoading(true);
            try {
                const [baseData, targetData] = await Promise.all([
                    storageService.loadProject(baseId),
                    storageService.loadProject(targetId)
                ]);

                setMetrics({
                    base: metricCalculationService.calculateMetrics(baseData?.nodes || [], baseData?.edges || []),
                    target: metricCalculationService.calculateMetrics(targetData?.nodes || [], targetData?.edges || [])
                });
            } catch (error) {
                console.error("Failed to calculate metrics", error);
            } finally {
                setLoading(false);
            }
        };

        if (baseId && targetId) {
            loadMetrics();
        }
    }, [baseId, targetId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Calculating metrics...</div>;
    if (!metrics.base || !metrics.target) return <div className="p-8 text-center text-slate-500">Insufficient data for analysis</div>;

    const renderBar = (label, value, max, color = "bg-blue-500") => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="text-slate-900 font-bold">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    const renderComparisonCard = (title, icon, metricKey, benchmarkKey, formatValue = (v) => v) => {
        const baseVal = metrics.base[metricKey];
        const targetVal = metrics.target[metricKey];
        const benchmarkVal = currentBenchmark.metrics[benchmarkKey];

        // Determine max for scaling
        const max = Math.max(baseVal, targetVal, benchmarkVal) * 1.2;

        return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        {icon}
                    </div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                </div>

                <div className="space-y-4">
                    {renderBar("Current Org", formatValue(baseVal), max, "bg-slate-800")}
                    {renderBar("Target Scenario", formatValue(targetVal), max, "bg-blue-500")}
                    {renderBar(`${currentBenchmark.name} (Avg)`, formatValue(benchmarkVal), max, "bg-green-500")}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                    <p>
                        {baseVal > benchmarkVal
                            ? `Your ${title.toLowerCase()} is higher than the industry average.`
                            : `Your ${title.toLowerCase()} is within or below industry average.`}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-full overflow-y-auto">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Comparative Analysis</h2>
                    <p className="text-slate-500">Benchmark your organization against industry standards</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    <span className="px-3 text-sm font-medium text-slate-600">Benchmark:</span>
                    <select
                        value={selectedBenchmark}
                        onChange={(e) => setSelectedBenchmark(e.target.value)}
                        className="p-2 text-sm font-semibold text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer"
                    >
                        {benchmarks.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {renderComparisonCard(
                    "Org Layers",
                    <Layers size={20} />,
                    "layers",
                    "avgLayers"
                )}

                {renderComparisonCard(
                    "Span of Control",
                    <Users size={20} />,
                    "spanOfControl",
                    "avgSpanOfControl",
                    (v) => `1:${v}`
                )}

                {/* Headcount Card (No benchmark for total headcount usually, but good for context) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-800">Total Headcount</h3>
                    </div>
                    <div className="flex items-end gap-4 mb-4">
                        <div>
                            <div className="text-sm text-slate-500 mb-1">Current</div>
                            <div className="text-3xl font-bold text-slate-900">{metrics.base.totalHeadcount}</div>
                        </div>
                        <div className="text-slate-300 text-2xl">→</div>
                        <div>
                            <div className="text-sm text-slate-500 mb-1">Target</div>
                            <div className="text-3xl font-bold text-blue-600">{metrics.target.totalHeadcount}</div>
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        Change: <span className={metrics.target.totalHeadcount > metrics.base.totalHeadcount ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {metrics.target.totalHeadcount - metrics.base.totalHeadcount > 0 ? '+' : ''}
                            {metrics.target.totalHeadcount - metrics.base.totalHeadcount}
                        </span> employees
                    </div>
                </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <PieChart size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800">Department Distribution (%)</h3>
                </div>

                <div className="space-y-6">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 border-b border-slate-100 pb-2">
                        <div className="col-span-4">Department</div>
                        <div className="col-span-8 grid grid-cols-3 gap-4">
                            <div>Current</div>
                            <div>Target</div>
                            <div>Benchmark</div>
                        </div>
                    </div>

                    {/* Rows */}
                    {Object.keys(currentBenchmark.metrics.deptDistribution).map(dept => {
                        const basePct = metrics.base.deptDistribution[dept] || 0;
                        const targetPct = metrics.target.deptDistribution[dept] || 0;
                        const benchPct = currentBenchmark.metrics.deptDistribution[dept] || 0;

                        return (
                            <div key={dept} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4 font-medium text-slate-700">{dept}</div>
                                <div className="col-span-8 grid grid-cols-3 gap-4">
                                    <div className="relative h-2 bg-slate-100 rounded-full">
                                        <div className="absolute h-full bg-slate-800 rounded-full" style={{ width: `${Math.min(basePct, 100)}%` }}></div>
                                        <span className="absolute -top-5 left-0 text-xs font-bold text-slate-600">{basePct}%</span>
                                    </div>
                                    <div className="relative h-2 bg-slate-100 rounded-full">
                                        <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(targetPct, 100)}%` }}></div>
                                        <span className="absolute -top-5 left-0 text-xs font-bold text-blue-600">{targetPct}%</span>
                                    </div>
                                    <div className="relative h-2 bg-slate-100 rounded-full">
                                        <div className="absolute h-full bg-green-500 rounded-full opacity-50" style={{ width: `${Math.min(benchPct, 100)}%` }}></div>
                                        <span className="absolute -top-5 left-0 text-xs font-bold text-green-600">{benchPct}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ComparativeDashboard;
