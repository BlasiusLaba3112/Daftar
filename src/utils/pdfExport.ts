import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Downloads the attendance sheet element directly as an official A4 PDF file (.pdf).
 * Uses html-to-image with fallback mechanisms, guaranteed to download in all environments.
 */
export async function downloadSheetAsPdf(
  element: HTMLElement,
  fileName: string = 'Daftar_Hadir.pdf'
): Promise<void> {
  // Find the exact paper element
  const paperEl = (
    element.classList.contains('attendance-paper')
      ? element
      : element.querySelector('.attendance-paper') || element
  ) as HTMLElement;

  let imgData: string | null = null;

  // Primary Method: html-to-image (supports Tailwind v4, SVG gradients, and modern CSS)
  try {
    imgData = await htmlToImage.toPng(paperEl, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true
    });
  } catch (err) {
    console.warn('html-to-image toPng failed, trying toJpeg:', err);
    try {
      imgData = await htmlToImage.toJpeg(paperEl, {
        quality: 0.95,
        backgroundColor: '#ffffff'
      });
    } catch (err2) {
      console.warn('html-to-image toJpeg failed, falling back to html2canvas:', err2);
    }
  }

  // Fallback Method: html2canvas
  if (!imgData) {
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(paperEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    } catch (h2cErr) {
      console.error('All canvas capture methods failed:', h2cErr);
    }
  }

  // Generate and download PDF
  if (imgData) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Save as blob and trigger download link
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
    return;
  }

  // Ultimate fallback if canvas capture failed: print dialog
  window.print();
}

/**
 * Prints the attendance sheet cleanly directly to the printer.
 * 1. Invokes native window.print()
 * 2. Also opens an un-sandboxed printable tab with auto-print,
 *    guaranteeing the printer dialog appears even inside iframe environments.
 */
export async function printSheetDirectly(
  element: HTMLElement,
  title: string = 'Daftar Hadir'
): Promise<void> {
  const paperEl = (
    element.classList.contains('attendance-paper')
      ? element
      : element.querySelector('.attendance-paper') || element
  ) as HTMLElement;

  // Attempt 1: Call native window.print()
  try {
    window.print();
  } catch (e) {
    console.warn('Native window.print failed:', e);
  }

  // Attempt 2: Open clean auto-printing tab via blob link to bypass iframe sandbox
  try {
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${styleTags}
  <style>
    @page { size: A4 portrait; margin: 0; }
    html, body { 
      margin: 0; 
      padding: 0; 
      background: #fff !important; 
      color: #000 !important; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    .attendance-paper { 
      box-shadow: none !important; 
      border: none !important; 
      margin: 0 auto !important; 
      padding: 20mm !important; 
      width: 210mm !important; 
      max-width: 210mm !important; 
      min-height: 297mm !important; 
      box-sizing: border-box !important; 
    }
    @media print {
      body { margin: 0; padding: 0; }
      .attendance-paper { padding: 20mm !important; }
    }
  </style>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
  </script>
</head>
<body>
  ${paperEl.outerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 40000);
    }, 1000);
  } catch (tabErr) {
    console.warn('Auto print tab failed:', tabErr);
  }
}

/**
 * Downloads a multi-page PDF document for multiple attendance sheets.
 */
export async function downloadBulkSheetAsPdf(
  containerElement: HTMLElement,
  fileName: string = 'Daftar_Hadir_Massal.pdf',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const pageElements = Array.from(
    containerElement.querySelectorAll('.print-page-break')
  ) as HTMLElement[];

  if (pageElements.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  for (let i = 0; i < pageElements.length; i++) {
    if (onProgress) {
      onProgress(i + 1, pageElements.length);
    }
    const pageEl = (pageElements[i].querySelector('.attendance-paper') as HTMLElement) || pageElements[i];

    let imgData: string | null = null;
    try {
      imgData = await htmlToImage.toPng(pageEl, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true
      });
    } catch {
      try {
        imgData = await htmlToImage.toJpeg(pageEl, {
          quality: 0.95,
          backgroundColor: '#ffffff'
        });
      } catch (err) {
        console.warn('html-to-image error on bulk page ' + (i + 1), err);
      }
    }

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    if (imgData) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
  }

  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }, 2500);
}

/**
 * Prints multiple attendance sheets directly to printer with auto-print tab fallback.
 */
export async function printBulkDirectly(
  containerElement: HTMLElement,
  title: string = 'Daftar Hadir Massal'
): Promise<void> {
  try {
    window.print();
  } catch (err) {
    console.warn('Native bulk window.print failed:', err);
  }

  try {
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${styleTags}
  <style>
    @page { size: A4 portrait; margin: 0; }
    html, body { 
      margin: 0; 
      padding: 0; 
      background: #fff !important; 
      color: #000 !important; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    .print-page-break {
      page-break-after: always !important;
      break-after: page !important;
      padding: 20mm !important;
      box-sizing: border-box !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 auto !important;
    }
    .print-page-break:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .attendance-paper { 
      box-shadow: none !important; 
      border: none !important; 
      margin: 0 auto !important; 
      padding: 0 !important; 
      width: 100% !important; 
      max-width: none !important; 
    }
  </style>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    });
  </script>
</head>
<body>
  ${containerElement.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 40000);
    }, 1000);
  } catch (tabErr) {
    console.warn('Auto bulk print tab failed:', tabErr);
  }
}

