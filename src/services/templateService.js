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
                { id: 'ceo', type: 'org', position: { x: 400, y: 0 }, data: { label: 'CEO', role: 'CEO', department: 'Executive' } },
                { id: 'cto', type: 'org', position: { x: 200, y: 150 }, data: { label: 'CTO', role: 'CTO', department: 'Engineering' } },
                { id: 'cro', type: 'org', position: { x: 600, y: 150 }, data: { label: 'CRO', role: 'CRO', department: 'Sales' } },
                { id: 'vp_product', type: 'org', position: { x: 400, y: 150 }, data: { label: 'VP Product', role: 'VP Product', department: 'Product' } },
                // Engineering
                { id: 'eng_mgr_1', type: 'org', position: { x: 100, y: 300 }, data: { label: 'Eng Manager', role: 'Eng Manager (Platform)', department: 'Engineering' } },
                { id: 'eng_mgr_2', type: 'org', position: { x: 300, y: 300 }, data: { label: 'Eng Manager', role: 'Eng Manager (Product)', department: 'Engineering' } },
                // Sales
                { id: 'sales_mgr', type: 'org', position: { x: 600, y: 300 }, data: { label: 'Sales Manager', role: 'Sales Manager', department: 'Sales' } },
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
                { id: 'ceo', type: 'org', position: { x: 400, y: 0 }, data: { label: 'CEO', role: 'CEO', department: 'Executive' } },
                { id: 'vp_eng', type: 'org', position: { x: 200, y: 150 }, data: { label: 'VP Engineering', role: 'VP Engineering', department: 'Engineering' } },
                { id: 'vp_product', type: 'org', position: { x: 600, y: 150 }, data: { label: 'VP Product', role: 'VP Product', department: 'Product' } },
                // Functional Leads
                { id: 'fe_lead', type: 'org', position: { x: 100, y: 300 }, data: { label: 'Frontend Lead', role: 'Frontend Lead', department: 'Engineering' } },
                { id: 'be_lead', type: 'org', position: { x: 300, y: 300 }, data: { label: 'Backend Lead', role: 'Backend Lead', department: 'Engineering' } },
                // Product Owners
                { id: 'prod_a', type: 'org', position: { x: 500, y: 300 }, data: { label: 'Product A Owner', role: 'Product A Owner', department: 'Product' } },
                { id: 'prod_b', type: 'org', position: { x: 700, y: 300 }, data: { label: 'Product B Owner', role: 'Product B Owner', department: 'Product' } },
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
        const userTemplates = storageService.getTemplates();
        return [...DEFAULT_TEMPLATES, ...userTemplates];
    },

    /**
     * Save a project as a new template
     * @param {string} projectId 
     * @param {Object} metadata { name, description, category, tags }
     */
    saveProjectAsTemplate: async (projectId, metadata) => {
        const projectData = await storageService.loadProject(projectId);
        if (!projectData) throw new Error("Project data not found");

        const template = {
            id: `template_${Date.now()}`,
            name: metadata.name,
            description: metadata.description,
            category: metadata.category || 'Custom',
            tags: metadata.tags || [],
            structure: {
                nodes: projectData.nodes,
                edges: projectData.edges
            },
            createdAt: Date.now()
        };

        storageService.saveTemplate(template);
        return template.id;
    },

    /**
     * Create a new project from a template
     * @param {string} templateId 
     * @param {Object} projectMetadata 
     */
    createProjectFromTemplate: async (templateId, projectMetadata) => {
        const allTemplates = templateService.getTemplates();
        const template = allTemplates.find(t => t.id === templateId);

        if (!template) throw new Error(`Template ${templateId} not found`);

        // Create the project entry
        const newProjectId = await storageService.createProject({
            ...projectMetadata,
            type: 'ACTUAL' // It becomes a real project
        });

        // Save the template data as the project data
        // Deep copy to ensure independence
        const nodes = JSON.parse(JSON.stringify(template.structure.nodes));
        const edges = JSON.parse(JSON.stringify(template.structure.edges));

        await storageService.saveProject(newProjectId, {
            nodes,
            edges
        });

        return newProjectId;
    }
};
