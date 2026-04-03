import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadPDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found');
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center vertically if it's shorter than A4
        const yPos = imgHeight < 297 ? (297 - imgHeight) / 2 : 0;

        pdf.addImage(imgData, 'PNG', 0, yPos, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
