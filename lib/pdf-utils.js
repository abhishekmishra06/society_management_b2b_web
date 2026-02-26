import { jsPDF } from 'jspdf';

/**
 * Generate a receipt PDF and trigger download
 */
export function generateReceiptPDF(receipt) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(105, 76, 208); // #694cd0
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MyTower', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Society Management System', pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageWidth / 2, 40, { align: 'center' });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  
  // Receipt info box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 52, pageWidth - 30, 25, 3, 3);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', 20, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.id || 'N/A', 55, 62);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 120, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 138, 62);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 20, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.paymentMethod || 'N/A', 62, 72);
  
  // Resident details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 15, 92);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${receipt.residentName || 'N/A'}`, 15, 102);
  doc.text(`Flat Number: ${receipt.flatNumber || 'N/A'}`, 15, 112);
  doc.text(`Bill Type: ${(receipt.billType || 'maintenance').toUpperCase()}`, 15, 122);
  
  // Amount section
  doc.setDrawColor(105, 76, 208);
  doc.setLineWidth(0.5);
  doc.line(15, 132, pageWidth - 15, 132);
  
  // Table header
  doc.setFillColor(245, 245, 255);
  doc.rect(15, 138, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description', 20, 145);
  doc.text('Amount', pageWidth - 40, 145, { align: 'right' });
  
  // Table content
  doc.setFont('helvetica', 'normal');
  const billTypeLabel = (receipt.billType || 'maintenance').charAt(0).toUpperCase() + (receipt.billType || 'maintenance').slice(1);
  doc.text(`${billTypeLabel} Charges`, 20, 158);
  doc.text(`Rs. ${(receipt.amount || 0).toLocaleString('en-IN')}`, pageWidth - 40, 158, { align: 'right' });
  
  // Total
  doc.setDrawColor(105, 76, 208);
  doc.line(15, 165, pageWidth - 15, 165);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Paid:', 20, 175);
  doc.setTextColor(16, 185, 129); // green
  doc.text(`Rs. ${(receipt.amount || 0).toLocaleString('en-IN')}`, pageWidth - 40, 175, { align: 'right' });
  
  // Status badge
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(16, 185, 129); // green
  doc.roundedRect(15, 185, 30, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.text('PAID', 22, 191);
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.line(15, 250, pageWidth - 15, 250);
  doc.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, 258, { align: 'center' });
  doc.text('MyTower Society Management System', pageWidth / 2, 265, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 272, { align: 'center' });
  
  // Save
  doc.save(`Receipt_${receipt.id || 'unknown'}.pdf`);
}

/**
 * Generate a gate pass PDF and trigger download
 */
export function generateGatePassPDF(pass) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(105, 76, 208);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MyTower', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(14);
  doc.text('VISITOR GATE PASS', pageWidth / 2, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  // Pass details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pass ID: ${pass.id || 'N/A'}`, 15, 55);
  
  // Status
  const isActive = pass.status === 'active';
  doc.setFillColor(isActive ? 16 : 150, isActive ? 185 : 150, isActive ? 129 : 150);
  doc.roundedRect(pageWidth - 55, 48, 40, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(isActive ? 'ACTIVE' : 'EXPIRED', pageWidth - 35, 55, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Details box
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 65, pageWidth - 30, 70, 3, 3);
  
  const details = [
    ['Visitor Name', pass.visitorName || 'N/A'],
    ['Visiting Flat', pass.flatNumber || 'N/A'],
    ['Resident Name', pass.residentName || 'N/A'],
    ['Purpose', pass.purpose || 'N/A'],
    ['Valid From', pass.validFrom ? new Date(pass.validFrom).toLocaleString('en-IN') : 'N/A'],
    ['Valid Until', pass.validUntil ? new Date(pass.validUntil).toLocaleString('en-IN') : 'N/A'],
  ];
  
  let y = 78;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 22, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, y);
    y += 10;
  });
  
  // QR Code placeholder
  doc.setDrawColor(105, 76, 208);
  doc.setLineWidth(1);
  doc.roundedRect(65, 148, 80, 80, 5, 5);
  doc.setFontSize(10);
  doc.setTextColor(105, 76, 208);
  doc.text('QR CODE', pageWidth / 2, 185, { align: 'center' });
  doc.setFontSize(8);
  doc.text(pass.qrCode || 'N/A', pageWidth / 2, 195, { align: 'center' });
  doc.setTextColor(100, 100, 100);
  doc.text('Scan for verification', pageWidth / 2, 222, { align: 'center' });
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.line(15, 250, pageWidth - 15, 250);
  doc.text('Present this pass at the security gate for entry.', pageWidth / 2, 258, { align: 'center' });
  doc.text('MyTower Society Management System', pageWidth / 2, 265, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 272, { align: 'center' });
  
  doc.save(`GatePass_${pass.id || 'unknown'}.pdf`);
}

/**
 * Generate a material exit pass PDF
 */
export function generateMaterialExitPassPDF(pass) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(105, 76, 208);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MyTower', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(14);
  doc.text('MATERIAL EXIT PASS', pageWidth / 2, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pass ID: ${pass.id || 'N/A'}`, 15, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 62, pageWidth - 30, 80, 3, 3);
  
  const details = [
    ['Flat Number', pass.flatNumber || 'N/A'],
    ['Resident Name', pass.residentName || 'N/A'],
    ['Material Description', pass.materialDescription || 'N/A'],
    ['Quantity', pass.quantity || 'N/A'],
    ['Carrier Name', pass.carrierName || 'N/A'],
    ['Carrier Contact', pass.carrierContact || 'N/A'],
    ['Date', pass.date ? new Date(pass.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
  ];
  
  let y = 75;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 22, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 75, y);
    y += 10;
  });
  
  // Authorization section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorization', 15, 160);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 162, pageWidth - 15, 162);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Resident Signature: ___________________', 15, 180);
  doc.text('Security Signature: ___________________', 115, 180);
  doc.text('Date: ___________________', 15, 195);
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.line(15, 250, pageWidth - 15, 250);
  doc.text('Security must verify material against this pass before allowing exit.', pageWidth / 2, 258, { align: 'center' });
  doc.text('MyTower Society Management System', pageWidth / 2, 265, { align: 'center' });
  
  doc.save(`MaterialExitPass_${pass.id || 'unknown'}.pdf`);
}

/**
 * Generate a generic report PDF
 */
export function generateReportPDF(title, data, columns) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(105, 76, 208);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MyTower', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, 28, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 15, 45);
  doc.text(`Total Records: ${data.length}`, pageWidth - 15, 45, { align: 'right' });
  
  // Table header
  const colWidth = (pageWidth - 30) / columns.length;
  let startY = 55;
  
  doc.setFillColor(245, 245, 255);
  doc.rect(15, startY - 5, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  
  columns.forEach((col, i) => {
    doc.text(col.label, 18 + (i * colWidth), startY + 2);
  });
  
  // Table rows
  doc.setFont('helvetica', 'normal');
  startY += 12;
  
  data.forEach((row, rowIndex) => {
    if (startY > 270) {
      doc.addPage();
      startY = 20;
    }
    
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 255);
      doc.rect(15, startY - 5, pageWidth - 30, 10, 'F');
    }
    
    columns.forEach((col, i) => {
      const value = String(row[col.key] || 'N/A').substring(0, 25);
      doc.text(value, 18 + (i * colWidth), startY + 2);
    });
    
    startY += 10;
  });
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('MyTower Society Management System', pageWidth / 2, 285, { align: 'center' });
  
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export data as CSV and trigger download
 */
export function exportCSV(data, columns, filename) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row => 
    columns.map(c => {
      const val = String(row[c.key] || '');
      // Escape commas and quotes in CSV
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  );
  
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
