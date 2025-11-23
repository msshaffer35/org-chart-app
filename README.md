# Org Chart App

A modern, interactive organization chart builder built with React, Vite, and React Flow. Create, edit, and manage organizational structures with ease.

## Features

-   **Interactive Canvas**: Drag and drop interface for building org charts.
-   **Node Types**:
    -   **Employee Cards**: Display name, role, department, and image.
    -   **Text Boxes**: Add movable, editable text annotations with formatting options (Bold, Italic, Color, Size).
-   **Smart Layout**: Automatic tree layout for organizational structures.
-   **Data Management**:
    -   **Import CSV**: Bulk import employee data.
    -   **Local Storage**: Auto-saves your work to your browser's local storage.
-   **Customization**:
    -   **Node Properties**: Edit details and styling for each node.
    -   **Conditional Formatting**: Highlight nodes based on rules (e.g., Department = Engineering).
    -   **View Settings**: Toggle visibility of fields (Name, Role, Department, Image).

## Tech Stack

-   **Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Diagramming**: [React Flow](https://reactflow.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **CSV Parsing**: [PapaParse](https://www.papaparse.com/)
-   **Layout Engine**: [Dagre](https://github.com/dagrejs/dagre)

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd org-chart-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## Usage

### Creating a Chart

1.  **Add Nodes**: Drag "Employee Card" or "Text Box" from the left panel toolbox onto the canvas.
2.  **Connect Nodes**: Drag from the bottom handle of a manager node to the top handle of a report node to create a reporting relationship.
3.  **Edit Details**: Click on a node to open the Right Panel.
    -   For **Employees**: Edit Name, Role, Department, and Header Color.
    -   For **Text**: Edit content and apply formatting (Bold, Italic, Size, Color).

### Importing Data

1.  Click the "Import CSV" button in the left panel.
2.  Upload a CSV file with the following columns: `id`, `name`, `role`, `department`, `managerId`.
3.  Map the columns and import to auto-generate the chart.

### Customizing View

1.  Click on the canvas background to see "Chart Settings" in the Right Panel.
2.  Adjust **Node Spacing** and **Connection Type** (Curved, Step, Straight).
3.  Toggle **Visible Fields** to show/hide specific information.
4.  Add **Conditional Formatting** rules to color-code nodes automatically.

## Project Structure

-   `src/components`: Reusable UI components (Canvas, Nodes, Layout).
-   `src/pages`: Application pages (ProjectList, Editor).
-   `src/store`: Global state management using Zustand.
-   `src/utils`: Helper functions (CSV parsing, layout logic).

## License

This project is private and proprietary.
