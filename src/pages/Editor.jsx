import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import MainLayout from '../components/Layout/MainLayout';
import useStore from '../store';
import { ArrowLeft } from 'lucide-react';

const Editor = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const loadChart = useStore((state) => state.loadChart);

    useEffect(() => {
        if (projectId) {
            loadChart(projectId);
        }
    }, [projectId, loadChart]);

    const currentProject = useStore((state) => state.currentProject);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <MainLayout>
            <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-all hover:shadow-md text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {currentProject && (
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 text-sm">
                        <div className="font-semibold text-slate-800 border-r border-slate-200 pr-3">
                            {currentProject.account || 'Untitled'}
                        </div>
                        <div className="text-slate-600 border-r border-slate-200 pr-3">
                            {currentProject.department || 'No Dept'}
                        </div>
                        <div className="text-slate-500">
                            {formatDate(currentProject.dateCollected)}
                        </div>
                    </div>
                )}
            </div>
            <OrgChartCanvas />
        </MainLayout>
    );
};

export default Editor;
