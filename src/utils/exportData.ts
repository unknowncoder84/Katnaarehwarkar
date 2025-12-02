import { Case } from '../types';

export const exportToCSV = (cases: Case[], filename: string = 'cases.csv') => {
  const headers = [
    'SR',
    'Client Name',
    'File No',
    'Next Date',
    'Stamp No',
    'Reg No',
    'Status',
    'Case Type',
    'Parties',
  ];

  const rows = cases.map((caseItem, index) => [
    index + 1,
    caseItem.clientName,
    caseItem.fileNo,
    new Date(caseItem.nextDate).toLocaleDateString(),
    caseItem.stampNo,
    caseItem.regNo,
    caseItem.status,
    caseItem.caseType,
    caseItem.partiesName,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const cellStr = String(cell);
          return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToExcel = (cases: Case[], filename: string = 'cases.xlsx') => {
  const headers = [
    'SR',
    'Client Name',
    'File No',
    'Next Date',
    'Stamp No',
    'Reg No',
    'Status',
    'Case Type',
    'Parties',
  ];

  const rows = cases.map((caseItem, index) => [
    index + 1,
    caseItem.clientName,
    caseItem.fileNo,
    new Date(caseItem.nextDate).toLocaleDateString(),
    caseItem.stampNo,
    caseItem.regNo,
    caseItem.status,
    caseItem.caseType,
    caseItem.partiesName,
  ]);

  // Create HTML table for Excel
  let html = '<table border="1"><thead><tr>';
  headers.forEach((header) => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';

  rows.forEach((row) => {
    html += '<tr>';
    row.forEach((cell) => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';

  downloadFile(html, filename, 'application/vnd.ms-excel');
};

export const exportToPDF = (cases: Case[], _filename: string = 'cases.pdf') => {
  const headers = [
    'SR',
    'Client Name',
    'File No',
    'Next Date',
    'Stamp No',
    'Reg No',
    'Status',
    'Case Type',
    'Parties',
  ];

  const rows = cases.map((caseItem, index) => [
    index + 1,
    caseItem.clientName,
    caseItem.fileNo,
    new Date(caseItem.nextDate).toLocaleDateString(),
    caseItem.stampNo,
    caseItem.regNo,
    caseItem.status,
    caseItem.caseType,
    caseItem.partiesName,
  ]);

  // Create HTML content for PDF
  let html = `
    <html>
      <head>
        <title>Case Management Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #E040FB; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:hover { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Case Management Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Use browser's print to PDF functionality
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default downloadFile;
