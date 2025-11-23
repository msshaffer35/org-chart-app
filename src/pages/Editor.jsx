import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import MainLayout from '../components/Layout/MainLayout';
import useStore from '../store/useStore';
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

    return (
        <MainLayout>
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-all hover:shadow-md text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </button>
            </div>
            <OrgChartCanvas />
        </MainLayout>
    );
};

export default Editor;
