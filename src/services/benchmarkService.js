/**
 * Benchmark Service
 * 
 * Provides industry benchmark data for organizational metrics.
 * Currently uses mock data, but designed to be extensible for real API integration.
 */

const BENCHMARKS = {
    'tech_series_a': {
        id: 'tech_series_a',
        name: 'Tech Startup (Series A)',
        description: 'High-growth technology companies with 50-150 employees',
        metrics: {
            avgLayers: 4,
            avgSpanOfControl: 7, // 1:7
            deptDistribution: {
                'Engineering': 40,
                'Sales': 25,
                'Product': 10,
                'Marketing': 10,
                'G&A': 15
            }
        }
    },
    'tech_series_c': {
        id: 'tech_series_c',
        name: 'Tech Scaleup (Series C)',
        description: 'Mature technology companies with 200-500 employees',
        metrics: {
            avgLayers: 6,
            avgSpanOfControl: 8, // 1:8
            deptDistribution: {
                'Engineering': 35,
                'Sales': 30,
                'Product': 8,
                'Marketing': 12,
                'G&A': 15
            }
        }
    },
    'enterprise_mfg': {
        id: 'enterprise_mfg',
        name: 'Enterprise Manufacturing',
        description: 'Large scale manufacturing organizations',
        metrics: {
            avgLayers: 8,
            avgSpanOfControl: 10, // 1:10
            deptDistribution: {
                'Operations': 45,
                'Sales': 20,
                'Engineering': 15,
                'G&A': 20
            }
        }
    },
    'consulting_firm': {
        id: 'consulting_firm',
        name: 'Professional Services',
        description: 'Consulting and professional services firms',
        metrics: {
            avgLayers: 5,
            avgSpanOfControl: 6, // 1:6
            deptDistribution: {
                'Professional Services': 60,
                'Sales': 15,
                'G&A': 25
            }
        }
    }
};

export const benchmarkService = {
    /**
     * Get all available benchmarks
     * @returns {Array} List of benchmark objects
     */
    getBenchmarks: () => {
        return Object.values(BENCHMARKS);
    },

    /**
     * Get a specific benchmark by ID
     * @param {string} id 
     * @returns {Object|null}
     */
    getBenchmark: (id) => {
        return BENCHMARKS[id] || null;
    }
};
