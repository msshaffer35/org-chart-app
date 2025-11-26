/**
 * Settings Slice
 * Manages visual configuration and conditional formatting
 */
export const createSettingsSlice = (set, get) => ({
    // State
    settings: {
        spacing: 100,
        layoutDirection: 'TB',
        edgeType: 'smoothstep',
        edgeStroke: 'solid', // 'solid' or 'dotted'
        visibleFields: {
            name: true,
            role: true,
            department: true,
            image: true,
        },
        formattingRules: [], // { id, field, operator, value, color }
        deidentifiedMode: false,
        deidentificationSettings: {
            enabled: false,
            maxLevels: 2, // Default to showing top 2 levels
            titleMappings: {}, // { "Original Title": "Standard Title" }
            departmentMappings: {}, // { "Original Dept": "Standard Dept" }
        },
    },

    // Actions
    updateSettings: (newSettings) => {
        set((state) => {
            const updatedSettings = { ...state.settings, ...newSettings };

            // If edge type or stroke changed, update all edges
            let newEdges = state.edges;

            if (newSettings.edgeType && newSettings.edgeType !== state.settings.edgeType) {
                newEdges = newEdges.map(e => ({ ...e, type: newSettings.edgeType }));
            }

            if (newSettings.edgeStroke && newSettings.edgeStroke !== state.settings.edgeStroke) {
                const style = newSettings.edgeStroke === 'dotted' ? { strokeDasharray: '5,5' } : {};
                newEdges = newEdges.map(e => ({ ...e, style }));
            }

            const newState = { settings: updatedSettings, edges: newEdges };
            return newState;
        });

        // Trigger layout if spacing or direction changed
        if (newSettings.spacing || newSettings.layoutDirection) {
            get().layoutNodes();
        }
    },
});
