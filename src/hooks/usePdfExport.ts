import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { showSuccess, showError } from '@/utils/toast';

interface ExportOptions {
  project: any;
  selectedScenarioIds: string[];
  mainScenarioId: string;
  calculateTotals: (scenarioId: string) => any;
}

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      // Dynamically import heavy libs to keep bundle lean
      const [{ default: jsPDF }, { default: html2canvas }, { default: ProjectPdfReport }] =
        await Promise.all([
          import('jspdf'),
          import('html2canvas'),
          import('@/components/ProjectPdfReport'),
        ]);

      // Mount the report component into an off-screen container
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
      document.body.appendChild(container);

      await new Promise<void>(resolve => {
        const root = createRoot(container);
        const reportRef = React.createRef<HTMLDivElement>();

        const Report = () => (
          React.createElement(ProjectPdfReport, {
            ref: reportRef,
            project: options.project,
            selectedScenarioIds: options.selectedScenarioIds,
            mainScenarioId: options.mainScenarioId,
            calculateTotals: options.calculateTotals,
            key: 'pdf-report',
          })
        );

        root.render(React.createElement(Report));

        // Wait for fonts and layout
        setTimeout(async () => {
          const el = container.firstElementChild as HTMLElement;
          if (!el) { resolve(); return; }

          const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#f7f6f2',
            windowWidth: 900,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [900, Math.ceil(canvas.height / 2)],
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = imgWidth / pdfWidth;
          const totalPages = Math.ceil(imgHeight / (pdfHeight * ratio));

          for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage();
            pdf.addImage(
              imgData,
              'JPEG',
              0,
              -(page * pdfHeight),
              pdfWidth,
              imgHeight / ratio,
            );
          }

          const title = options.project.metadata.title || 'rapport';
          const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-rapport.pdf`;
          pdf.save(filename);

          root.unmount();
          document.body.removeChild(container);
          resolve();
        }, 500);
      });

      showSuccess('PDF exporté avec succès');
    } catch (err) {
      console.error('PDF export error:', err);
      showError('Erreur lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPdf, isExporting };
}
