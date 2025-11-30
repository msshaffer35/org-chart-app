import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import MainLayout from '../components/Layout/MainLayout';
import useStore from '../store';
import { ArrowLeft, Save } from 'lucide-react';
import SaveTemplateModal from '../components/SaveTemplateModal';
import { templateService } from '../services/templateService';

const Editor = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const loadChart = useStore((state) => state.loadChart);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

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

    const handleSaveTemplate = async (metadata) => {
        setIsSavingTemplate(true);
        try {
            await templateService.saveProjectAsTemplate(projectId, metadata);
            setShowSaveModal(false);
            alert('Template saved successfully!');
        } catch (error) {
            console.error('Failed to save template:', error);
            alert('Failed to save template');
        } finally {
            setIsSavingTemplate(false);
        }
    };

    useEffect(() => {
        if (saveStatus === 'saved') {
            const timer = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

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

                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={useStore((state) => state.settings?.autoSaveEnabled || false)}
                                onChange={(e) => {
                                    useStore.getState().updateSettings({ autoSaveEnabled: e.target.checked });
                                }}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-600">Auto-Save</span>
                    </label>
                </div>

                <button
                    onClick={async () => {
                        try {
                            setIsSaving(true);
                            setSaveStatus('saving');
                            const saveProject = useStore.getState().saveProject;
                            if (saveProject) {
                                await saveProject();
                                setSaveStatus('saved');
                            }
                        } catch (error) {
                            console.error('Manual save failed:', error);
                            setSaveStatus('error');
                            alert('Failed to save project');
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm border transition-all hover:shadow-md text-sm font-medium ${saveStatus === 'saved'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-900 border-slate-200'
                        }`}
                >
                    <Save size={16} className={saveStatus === 'saved' ? 'text-green-600' : ''} />
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </button>

                <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all hover:shadow-md text-sm font-medium"
                >
                    <Save size={16} />
                    Save as Template
                </button>
            </div>

            <OrgChartCanvas />

            <SaveTemplateModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSaveTemplate}
                isSaving={isSavingTemplate}
            />
        </MainLayout>
    );
};

export default Editor;
