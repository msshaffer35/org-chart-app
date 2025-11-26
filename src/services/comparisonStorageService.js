/**
 * Comparison Storage Service
 *
 * Manages storage of side-by-side comparison analysis data.
 * Comparison records are stored separately from project data to maintain
 * symmetry and allow multiple comparisons between the same projects.
 */

const COMPARISON_PREFIX = 'org_chart_comparison_'; // Pattern: org_chart_comparison_{leftId}_{rightId}

export const comparisonStorageService = {
    /**
     * Generate localStorage key for a comparison
     * @param {string} leftId - Left project ID
     * @param {string} rightId - Right project ID
     * @returns {string} Storage key
     */
    getComparisonKey: (leftId, rightId) => {
        return `${COMPARISON_PREFIX}${leftId}_${rightId}`;
    },

    /**
     * Load comparison analysis data
     * @param {string} leftId - Left project ID
     * @param {string} rightId - Right project ID
     * @returns {Object|null} Comparison record or null if not found
     */
    loadComparison: (leftId, rightId) => {
        try {
            const key = comparisonStorageService.getComparisonKey(leftId, rightId);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load comparison data:', error);
            return null;
        }
    },

    /**
     * Save comparison analysis data
     * @param {string} leftId - Left project ID
     * @param {string} rightId - Right project ID
     * @param {Object} analysisData - SWOT and notes data
     * @param {string} leftName - Left project name
     * @param {string} rightName - Right project name
     * @returns {Promise<boolean>} Success status
     */
    saveComparison: (leftId, rightId, analysisData, leftName = '', rightName = '') => {
        try {
            const key = comparisonStorageService.getComparisonKey(leftId, rightId);

            // Load existing comparison or create new structure
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
     * @param {string} leftId - Left project ID
     * @param {string} rightId - Right project ID
     * @returns {Promise<boolean>} Success status
     */
    deleteComparison: (leftId, rightId) => {
        try {
            const key = comparisonStorageService.getComparisonKey(leftId, rightId);
            localStorage.removeItem(key);
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to delete comparison:', error);
            return Promise.reject(error);
        }
    },

    /**
     * List all comparison records
     * @returns {Array} Array of comparison records
     */
    listComparisons: () => {
        try {
            const comparisons = [];

            // Iterate through localStorage to find all comparison keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);

                if (key && key.startsWith(COMPARISON_PREFIX)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        comparisons.push(data);
                    } catch (parseError) {
                        console.warn(`Failed to parse comparison data for key ${key}:`, parseError);
                    }
                }
            }

            // Sort by last modified (most recent first)
            comparisons.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

            return comparisons;
        } catch (error) {
            console.error('Failed to list comparisons:', error);
            return [];
        }
    },

    /**
     * Check if a comparison exists
     * @param {string} leftId - Left project ID
     * @param {string} rightId - Right project ID
     * @returns {boolean} True if comparison exists
     */
    comparisonExists: (leftId, rightId) => {
        const key = comparisonStorageService.getComparisonKey(leftId, rightId);
        return localStorage.getItem(key) !== null;
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
