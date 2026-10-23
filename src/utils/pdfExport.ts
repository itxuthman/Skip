/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementAsPdf(elementId: string, filename: string = 'document.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found for PDF export.`);
    return;
  }

  try {
    // Temporarily ensure background is white for clean PDF rendering
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ffffff';

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    element.style.backgroundColor = originalBg;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (err) {
    console.error('PDF export failed, falling back to window.print()', err);
    window.print();
  }
}
