import { storageService } from './storageService';

/**
 * Template Service
 * 
 * Manages organizational design patterns and templates.
 * Allows creating new projects from predefined or custom templates.
 */

const DEFAULT_TEMPLATES = [
    {
        id: 'template_scaling_series_a',
        name: 'Scaling Series A',
        description: 'Typical structure for a post-Series A startup (50-100 employees). Focus on functional specialization.',
        category: 'Startup',
        tags: ['Growth', 'Tech'],
        structure: {
            nodes: [
                { id: 'ceo', type: 'position', position: { x: 400, y: 0 }, data: { title: 'CEO', department: 'Executive' } },
                { id: 'cto', type: 'position', position: { x: 200, y: 150 }, data: { title: 'CTO', department: 'Engineering' } },
                { id: 'cro', type: 'position', position: { x: 600, y: 150 }, data: { title: 'CRO', department: 'Sales' } },
                { id: 'vp_product', type: 'position', position: { x: 400, y: 150 }, data: { title: 'VP Product', department: 'Product' } },
                // Engineering
                { id: 'eng_mgr_1', type: 'position', position: { x: 100, y: 300 }, data: { title: 'Eng Manager (Platform)', department: 'Engineering' } },
                { id: 'eng_mgr_2', type: 'position', position: { x: 300, y: 300 }, data: { title: 'Eng Manager (Product)', department: 'Engineering' } },
                // Sales
                { id: 'sales_mgr', type: 'position', position: { x: 600, y: 300 }, data: { title: 'Sales Manager', department: 'Sales' } },
            ],
            edges: [
                { id: 'e1', source: 'ceo', target: 'cto' },
                { id: 'e2', source: 'ceo', target: 'cro' },
                { id: 'e3', source: 'ceo', target: 'vp_product' },
                { id: 'e4', source: 'cto', target: 'eng_mgr_1' },
                { id: 'e5', source: 'cto', target: 'eng_mgr_2' },
                { id: 'e6', source: 'cro', target: 'sales_mgr' },
            ]
        }
    },
    {
        id: 'template_matrix_org',
        name: 'Matrix Organization',
        description: 'Dual reporting structure for multi-product companies. Balances functional excellence with product delivery.',
        category: 'Enterprise',
        tags: ['Complex', 'Multi-product'],
        structure: {
            nodes: [
                { id: 'ceo', type: 'position', position: { x: 400, y: 0 }, data: { title: 'CEO', department: 'Executive' } },
                { id: 'vp_eng', type: 'position', position: { x: 200, y: 150 }, data: { title: 'VP Engineering', department: 'Engineering' } },
                { id: 'vp_product', type: 'position', position: { x: 600, y: 150 }, data: { title: 'VP Product', department: 'Product' } },
                // Functional Leads
                { id: 'fe_lead', type: 'position', position: { x: 100, y: 300 }, data: { title: 'Frontend Lead', department: 'Engineering' } },
                { id: 'be_lead', type: 'position', position: { x: 300, y: 300 }, data: { title: 'Backend Lead', department: 'Engineering' } },
                // Product Owners
                { id: 'prod_a', type: 'position', position: { x: 500, y: 300 }, data: { title: 'Product A Owner', department: 'Product' } },
                { id: 'prod_b', type: 'position', position: { x: 700, y: 300 }, data: { title: 'Product B Owner', department: 'Product' } },
            ],
            edges: [
                { id: 'e1', source: 'ceo', target: 'vp_eng' },
                { id: 'e2', source: 'ceo', target: 'vp_product' },
                { id: 'e3', source: 'vp_eng', target: 'fe_lead' },
                { id: 'e4', source: 'vp_eng', target: 'be_lead' },
                { id: 'e5', source: 'vp_product', target: 'prod_a' },
                { id: 'e6', source: 'vp_product', target: 'prod_b' },
            ]
        }
    }
];

export const templateService = {
    /**
     * Get all available templates (default + user saved)
     */
    getTemplates: () => {
        // In a real app, we'd merge these with user-saved templates from storageService
        // For now, we'll just return defaults
        return DEFAULT_TEMPLATES;
    },

    /**
     * Create a new project from a template
     * @param {string} templateId 
     * @param {Object} projectMetadata 
     */
    createProjectFromTemplate: async (templateId, projectMetadata) => {
        const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
        if (!template) throw new Error(`Template ${templateId} not found`);

        // Create the project entry
        const newProjectId = await storageService.createProject({
            ...projectMetadata,
            type: 'ACTUAL' // It becomes a real project
        });

        // Save the template data as the project data
        await storageService.saveProject(newProjectId, {
            nodes: template.structure.nodes,
            edges: template.structure.edges
        });

        return newProjectId;
    }
};
