/**
 * Comparison Storage Service
 *
 * Manages storage of side-by-side comparison analysis data.
 * Comparison records are stored separately from project data to maintain
 * symmetry and allow multiple comparisons between the same projects.
 */

const COMPARISON_PREFIX = 'org_chart_analysis_'; // New Pattern: org_chart_analysis_{uuid}
const LEGACY_PREFIX = 'org_chart_comparison_'; // Old Pattern

export const comparisonStorageService = {
    /**
     * Generate a unique ID for a new analysis
     * @returns {string} Unique ID
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Create a new analysis record
     * @param {string} type - Type of analysis ('side-by-side', 'temporal', etc.)
     * @param {Array} projectIds - Array of project IDs involved
     * @param {Object} meta - Additional metadata (names, etc.)
     * @param {string} name - Optional custom name for the analysis
     * @returns {Promise<string>} The new analysis ID
     */
    createAnalysis: (type, projectIds, meta = {}, name = null) => {
        try {
            const id = comparisonStorageService.generateId();
            const key = `${COMPARISON_PREFIX}${id}`;

            // Generate default name if not provided
            const defaultName = name || `Analysis ${new Date().toLocaleDateString()}`;

            const analysisRecord = {
                id,
                name: defaultName,
                type,
                projectIds,
                meta,
                createdAt: Date.now(),
                lastModified: Date.now(),
                analysis: comparisonStorageService.getEmptyAnalysis()
            };

            localStorage.setItem(key, JSON.stringify(analysisRecord));
            return Promise.resolve(id);
        } catch (error) {
            console.error('Failed to create analysis:', error);
            return Promise.reject(error);
        }
    },

    /**
     * Rename an analysis
     * @param {string} id - Analysis ID
     * @param {string} newName - New name for the analysis
     * @returns {Promise<boolean>} Success status
     */
    renameAnalysis: (id, newName) => {
        try {
            const key = `${COMPARISON_PREFIX}${id}`;
            const existing = comparisonStorageService.getAnalysis(id);

            if (!existing) {
                throw new Error(`Analysis ${id} not found`);
            }

            const updated = {
                ...existing,
                name: newName,
                lastModified: Date.now()
            };

            localStorage.setItem(key, JSON.stringify(updated));
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to rename analysis:', error);
            return Promise.reject(error);
        }
    },

    /**
     * Get analysis by ID
     * @param {string} id - Analysis ID
     * @returns {Object|null} Analysis record
     */
    getAnalysis: (id) => {
        try {
            // Try new prefix first
            const key = `${COMPARISON_PREFIX}${id}`;
            const data = localStorage.getItem(key);
            if (data) return JSON.parse(data);

            // Fallback to check if it's a legacy key (though legacy keys were composite)
            return null;
        } catch (error) {
            console.error('Failed to load analysis:', error);
            return null;
        }
    },

    /**
     * Save/Update analysis data
     * @param {string} id - Analysis ID
     * @param {Object} analysisData - The analysis content (SWOT, notes)
     * @returns {Promise<boolean>} Success status
     */
    saveAnalysis: (id, analysisData) => {
        try {
            const key = `${COMPARISON_PREFIX}${id}`;
            const existing = comparisonStorageService.getAnalysis(id);

            if (!existing) {
                throw new Error(`Analysis ${id} not found`);
            }

            const updated = {
                ...existing,
                analysis: analysisData,
                lastModified: Date.now()
            };

            localStorage.setItem(key, JSON.stringify(updated));
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to save analysis:', error);
            return Promise.reject(error);
        }
    },

    /**
     * Load comparison analysis data (Legacy Support)
     * @param {string} leftId - Left project ID
     * @param {string} rightId - Right project ID
     * @returns {Object|null} Comparison record or null if not found
     */
    loadComparison: (leftId, rightId) => {
        try {
            // Legacy check
            const legacyKey = `${LEGACY_PREFIX}${leftId}_${rightId}`;
            const legacyData = localStorage.getItem(legacyKey);
            if (legacyData) return JSON.parse(legacyData);

            return null;
        } catch (error) {
            console.error('Failed to load comparison data:', error);
            return null;
        }
    },

    /**
     * Save comparison analysis data (Legacy Support)
     * @deprecated Use createAnalysis/saveAnalysis instead
     */
    saveComparison: (leftId, rightId, analysisData, leftName = '', rightName = '') => {
        try {
            const key = `${LEGACY_PREFIX}${leftId}_${rightId}`;
            const existingComparison = comparisonStorageService.loadComparison(leftId, rightId);

            const comparisonRecord = {
                id: `comparison_${leftId}_${rightId}`,
                leftProjectId: leftId,
                rightProjectId: rightId,
                leftProjectName: leftName,
                rightProjectName: rightName,
                createdAt: existingComparison?.createdAt || Date.now(),
                lastModified: Date.now(),
                analysis: analysisData
            };

            localStorage.setItem(key, JSON.stringify(comparisonRecord));
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to save comparison data:', error);
            return Promise.reject(error);
        }
    },

    /**
     * Delete a comparison record
     * @param {string} id - Analysis ID
     * @returns {Promise<boolean>} Success status
     */
    deleteAnalysis: (id) => {
        try {
            const key = `${COMPARISON_PREFIX}${id}`;
            localStorage.removeItem(key);
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to delete analysis:', error);
            return Promise.reject(error);
        }
    },

    /**
     * List all analysis records
     * @returns {Array} Array of analysis records
     */
    listAnalyses: () => {
        try {
            const analyses = [];

            // Iterate through localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key && key.startsWith(COMPARISON_PREFIX)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        analyses.push(data);
                    } catch (parseError) {
                        console.warn(`Failed to parse analysis data for key ${key}:`, parseError);
                    }
                }
            }

            // Sort by last modified (most recent first)
            analyses.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

            return analyses;
        } catch (error) {
            console.error('Failed to list analyses:', error);
            return [];
        }
    },

    /**
     * Get initial empty analysis structure
     * @returns {Object} Empty analysis data structure
     */
    getEmptyAnalysis: () => {
        return {
            swot: {
                strengths: [],
                weaknesses: [],
                opportunities: [],
                threats: []
            },
            generalNotes: '',
            strategicAlignment: ''
        };
    }
};
