import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

export const exportToDocx = async (analysisData, projectData) => {
    try {
        const { name, analysis } = analysisData;
        const { swot, generalNotes, strategicAlignment } = analysis || {};

        const sections = [];

        // Title
        sections.push(
            new Paragraph({
                text: name || "Analysis Report",
                heading: HeadingLevel.TITLE,
                spacing: { after: 300 },
            })
        );

        // Project Info
        if (projectData) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Account: ", bold: true }),
                        new TextRun(projectData.account || "N/A"),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Department: ", bold: true }),
                        new TextRun(projectData.department || "N/A"),
                    ],
                    spacing: { after: 300 },
                })
            );
        }

        // SWOT Analysis
        if (swot) {
            sections.push(
                new Paragraph({
                    text: "SWOT Analysis",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 },
                })
            );

            const createSwotSection = (title, items) => {
                const paragraphs = [
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 100, after: 100 },
                    }),
                ];

                if (items && items.length > 0) {
                    items.forEach((item) => {
                        if (item.trim()) {
                            paragraphs.push(
                                new Paragraph({
                                    text: item,
                                    bullet: { level: 0 },
                                })
                            );
                        }
                    });
                } else {
                    paragraphs.push(
                        new Paragraph({
                            text: "No items listed.",
                            italics: true,
                        })
                    );
                }
                return paragraphs;
            };

            sections.push(...createSwotSection("Strengths", swot.strengths));
            sections.push(...createSwotSection("Weaknesses", swot.weaknesses));
            sections.push(...createSwotSection("Opportunities", swot.opportunities));
            sections.push(...createSwotSection("Threats", swot.threats));
        }

        // General Notes
        if (generalNotes) {
            sections.push(
                new Paragraph({
                    text: "General Notes",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 },
                }),
                new Paragraph({
                    text: generalNotes,
                })
            );
        }

        // Strategic Alignment
        if (strategicAlignment) {
            sections.push(
                new Paragraph({
                    text: "Strategic Alignment",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 },
                }),
                new Paragraph({
                    text: strategicAlignment,
                })
            );
        }

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: sections,
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${name || "Analysis"}.docx`);
        console.log("Document created successfully");
    } catch (error) {
        console.error("Error generating document:", error);
        alert("Failed to generate Word document.");
    }
};
