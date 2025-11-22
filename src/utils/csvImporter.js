import Papa from 'papaparse';

export const parseCSV = (file, callback) => {
    Papa.parse(file, {
        header: true,
        complete: (results) => {
            const { data } = results;
            const nodes = [];
            const edges = [];

            // Expected CSV headers: EmployeeID, Name, Role, Department, ManagerID

            data.forEach((row) => {
                if (!row.EmployeeID) return; // Skip empty rows

                // Create Node
                nodes.push({
                    id: row.EmployeeID,
                    type: 'org',
                    data: {
                        label: row.Name,
                        role: row.Role,
                        department: row.Department,
                        // Random color for demo if not provided
                        color: 'bg-blue-500',
                    },
                    position: { x: 0, y: 0 }, // Layout will handle position
                });

                // Create Edge (if has manager)
                if (row.ManagerID) {
                    edges.push({
                        id: `e${row.ManagerID}-${row.EmployeeID}`,
                        source: row.ManagerID,
                        target: row.EmployeeID,
                        type: 'smoothstep',
                    });
                }
            });

            callback({ nodes, edges });
        },
        error: (error) => {
            console.error('Error parsing CSV:', error);
        }
    });
};
