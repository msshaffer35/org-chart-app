import React from 'react';
import { templateService } from '../../services/templateService';
import { Copy, Layout, Tag } from 'lucide-react';

const TemplateList = ({ onUseTemplate }) => {
    const templates = templateService.getTemplates();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
                <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Layout size={24} />
                        </div>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {template.category}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{template.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 flex-grow">{template.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {template.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={() => onUseTemplate(template)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Copy size={18} />
                        Use Template
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TemplateList;
