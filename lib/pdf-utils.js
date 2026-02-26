import { jsPDF } from 'jspdf';

const BRAND_COLOR = [105, 76, 208]; // #694cd0
const SUCCESS_COLOR = [16, 185, 129];
const ERROR_COLOR = [239, 68, 68];
const WARNING_COLOR = [245, 158, 11];

function drawHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MyTower', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Society Management System', pageWidth / 2, 26, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 38, { align: 'center' });
  if (subtitle) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 50, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);
}

function drawFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 270, pageWidth - 15, 270);
  doc.setTextColor(130, 130, 130);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, 277, { align: 'center' });
  doc.text('MyTower Society Management System', pageWidth / 2, 282, { align: 'center' });
  doc.text('Generated: ' + new Date().toLocaleString('en-IN'), pageWidth / 2, 287, { align: 'center' });
}

function drawInfoRow(doc, label, value, x, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(label + ':', x, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(value || 'N/A'), x + 35, y);
}

function drawTable(doc, headers, rows, startY, colWidths) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalWidth = pageWidth - 30;
  const defaultColWidth = totalWidth / headers.length;
  const widths = colWidths || headers.map(() => defaultColWidth);
  
  // Header
  doc.setFillColor(240, 238, 255);
  doc.rect(15, startY - 5, totalWidth, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  let x = 18;
  headers.forEach((h, i) => {
    doc.text(h, x, startY + 2);
    x += widths[i];
  });
  
  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  let y = startY + 14;
  
  rows.forEach((row, rowIndex) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 255);
      doc.rect(15, y - 5, totalWidth, 10, 'F');
    }
    x = 18;
    row.forEach((cell, i) => {
      doc.text(String(cell).substring(0, 30), x, y + 2);
      x += widths[i];
    });
    y += 10;
  });
  
  return y;
}

// =============== RECEIPT PDF ===============
export function generateReceiptPDF(receipt) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'PAYMENT RECEIPT');
  
  // Receipt info
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 52, pageWidth - 30, 28, 3, 3);
  drawInfoRow(doc, 'Receipt No', receipt.id || 'N/A', 20, 62);
  drawInfoRow(doc, 'Date', receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 120, 62);
  drawInfoRow(doc, 'Method', receipt.paymentMethod || 'N/A', 20, 74);
  drawInfoRow(doc, 'Status', 'PAID', 120, 74);
  
  // Billed To
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', 15, 95);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Name: ' + (receipt.residentName || 'N/A'), 15, 105);
  doc.text('Flat: ' + (receipt.flatNumber || 'N/A'), 15, 114);
  doc.text('Type: ' + ((receipt.billType || 'maintenance').toUpperCase()), 15, 123);
  
  // Amount table
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(15, 132, pageWidth - 15, 132);
  
  doc.setFillColor(240, 238, 255);
  doc.rect(15, 136, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Description', 20, 143);
  doc.text('Amount', pageWidth - 40, 143, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  const billLabel = (receipt.billType || 'maintenance').charAt(0).toUpperCase() + (receipt.billType || 'maintenance').slice(1);
  doc.text(billLabel + ' Charges', 20, 156);
  const amt = Number(receipt.amount) || 0;
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 156, { align: 'right' });
  
  doc.line(15, 162, pageWidth - 15, 162);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Paid:', 20, 174);
  doc.setTextColor(...SUCCESS_COLOR);
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 174, { align: 'right' });
  
  // Paid badge
  doc.setFillColor(...SUCCESS_COLOR);
  doc.roundedRect(15, 182, 25, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('PAID', 20, 188);
  
  drawFooter(doc);
  doc.save('Receipt_' + (receipt.id || 'unknown').substring(0, 12) + '.pdf');
}

// =============== MAINTENANCE BILL PDF ===============
export function generateMaintenanceBillPDF(bill) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'MAINTENANCE BILL');
  
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 52, pageWidth - 30, 50, 3, 3);
  drawInfoRow(doc, 'Bill ID', (bill.id || 'N/A').substring(0, 20), 20, 64);
  drawInfoRow(doc, 'Flat No', bill.flatNumber || 'N/A', 120, 64);
  drawInfoRow(doc, 'Month', bill.month || 'N/A', 20, 76);
  drawInfoRow(doc, 'Due Date', bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'N/A', 120, 76);
  drawInfoRow(doc, 'Status', (bill.status || 'pending').toUpperCase(), 20, 88);
  drawInfoRow(doc, 'Generated', bill.generatedAt ? new Date(bill.generatedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 120, 88);
  
  // Amount section
  doc.setFillColor(240, 238, 255);
  doc.rect(15, 112, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Description', 20, 119);
  doc.text('Amount', pageWidth - 40, 119, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(bill.description || 'Monthly Maintenance Charge', 20, 132);
  const amt = Number(bill.amount) || 0;
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 132, { align: 'right' });
  
  doc.setDrawColor(...BRAND_COLOR);
  doc.line(15, 138, pageWidth - 15, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total Due:', 20, 152);
  doc.setTextColor(...(bill.status === 'paid' ? SUCCESS_COLOR : ERROR_COLOR));
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 152, { align: 'right' });
  
  // Status badge
  const isPaid = bill.status === 'paid';
  doc.setFillColor(...(isPaid ? SUCCESS_COLOR : WARNING_COLOR));
  doc.roundedRect(15, 160, 35, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(isPaid ? 'PAID' : 'PENDING', 22, 166);
  
  // Payment instructions
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('Please pay before the due date to avoid late fees.', 15, 185);
  doc.text('Payment modes: UPI, Cash, Bank Transfer, Card', 15, 193);
  
  drawFooter(doc);
  doc.save('MaintenanceBill_' + (bill.flatNumber || 'unknown') + '_' + (bill.month || '') + '.pdf');
}

// =============== UTILITY BILL PDF ===============
export function generateUtilityBillPDF(bill) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'UTILITY BILL - ' + (bill.type || 'ELECTRICITY').toUpperCase());
  
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 52, pageWidth - 30, 60, 3, 3);
  drawInfoRow(doc, 'Flat No', bill.flatNumber || 'N/A', 20, 64);
  drawInfoRow(doc, 'Bill Type', (bill.type || 'electricity').toUpperCase(), 120, 64);
  drawInfoRow(doc, 'Month', bill.month || 'N/A', 20, 76);
  drawInfoRow(doc, 'Status', (bill.status || 'pending').toUpperCase(), 120, 76);
  drawInfoRow(doc, 'Prev Reading', String(bill.previousReading || 0), 20, 88);
  drawInfoRow(doc, 'Curr Reading', String(bill.currentReading || 0), 120, 88);
  drawInfoRow(doc, 'Units Used', String(bill.units || (bill.currentReading - bill.previousReading) || 0), 20, 100);
  
  // Amount
  doc.setDrawColor(...BRAND_COLOR);
  doc.line(15, 120, pageWidth - 15, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total Amount:', 20, 136);
  const amt = Number(bill.amount) || 0;
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 136, { align: 'right' });
  
  drawFooter(doc);
  doc.save('UtilityBill_' + (bill.flatNumber || '') + '_' + (bill.month || '') + '.pdf');
}

// =============== SALARY SLIP PDF ===============
export function generateSalarySlipPDF(salary) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'SALARY SLIP', 'Month: ' + (salary.month || 'N/A'));
  
  // Employee details
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 55, pageWidth - 30, 35, 3, 3);
  drawInfoRow(doc, 'Staff ID', salary.staffId || 'N/A', 20, 67);
  drawInfoRow(doc, 'Name', salary.staffName || 'N/A', 120, 67);
  drawInfoRow(doc, 'Role', (salary.role || 'N/A').charAt(0).toUpperCase() + (salary.role || '').slice(1), 20, 79);
  drawInfoRow(doc, 'Month', salary.month || 'N/A', 120, 79);
  
  // Earnings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Earnings', 20, 105);
  doc.setDrawColor(...BRAND_COLOR);
  doc.line(15, 108, pageWidth / 2 - 5, 108);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Basic Salary', 20, 118);
  doc.text('Rs. ' + (salary.basicSalary || 0).toLocaleString('en-IN'), pageWidth / 2 - 20, 118, { align: 'right' });
  doc.text('Bonus', 20, 128);
  doc.text('Rs. ' + (salary.bonus || 0).toLocaleString('en-IN'), pageWidth / 2 - 20, 128, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Earnings', 20, 142);
  doc.setTextColor(...SUCCESS_COLOR);
  doc.text('Rs. ' + ((salary.basicSalary || 0) + (salary.bonus || 0)).toLocaleString('en-IN'), pageWidth / 2 - 20, 142, { align: 'right' });
  
  // Deductions
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Deductions', pageWidth / 2 + 10, 105);
  doc.setDrawColor(...ERROR_COLOR);
  doc.line(pageWidth / 2 + 5, 108, pageWidth - 15, 108);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Deductions', pageWidth / 2 + 10, 118);
  doc.text('Rs. ' + (salary.deductions || 0).toLocaleString('en-IN'), pageWidth - 20, 118, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('Total Deductions', pageWidth / 2 + 10, 142);
  doc.setTextColor(...ERROR_COLOR);
  doc.text('Rs. ' + (salary.deductions || 0).toLocaleString('en-IN'), pageWidth - 20, 142, { align: 'right' });
  
  // Net Salary
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(15, 155, pageWidth - 30, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('NET SALARY', 20, 167);
  doc.setFontSize(14);
  doc.text('Rs. ' + (salary.netSalary || 0).toLocaleString('en-IN'), pageWidth - 20, 167, { align: 'right' });
  
  // Status
  doc.setTextColor(0, 0, 0);
  const isPaid = salary.status === 'paid';
  doc.setFillColor(...(isPaid ? SUCCESS_COLOR : WARNING_COLOR));
  doc.roundedRect(15, 182, 25, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(isPaid ? 'PAID' : 'PENDING', 20, 188);
  
  drawFooter(doc);
  doc.save('SalarySlip_' + (salary.staffName || '').replace(/\s+/g, '_') + '_' + (salary.month || '') + '.pdf');
}

// =============== DUE STATEMENT PDF ===============
export function generateDueStatementPDF(due) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'DUE STATEMENT');
  
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 52, pageWidth - 30, 40, 3, 3);
  drawInfoRow(doc, 'Flat No', due.flatNumber || 'N/A', 20, 64);
  drawInfoRow(doc, 'Resident', due.residentName || 'N/A', 120, 64);
  drawInfoRow(doc, 'Due Date', due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-IN') : 'N/A', 20, 76);
  drawInfoRow(doc, 'Status', (due.status || 'pending').toUpperCase(), 120, 76);
  
  // Breakdown
  const y = 105;
  doc.setFillColor(240, 238, 255);
  doc.rect(15, y, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Item', 20, y + 7);
  doc.text('Amount', pageWidth - 40, y + 7, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Maintenance Amount', 20, y + 20);
  doc.text('Rs. ' + (Number(due.amount) || 0).toLocaleString('en-IN'), pageWidth - 40, y + 20, { align: 'right' });
  
  if (due.penalty > 0) {
    doc.setTextColor(...ERROR_COLOR);
    doc.text('Late Fee / Penalty', 20, y + 32);
    doc.text('Rs. ' + (Number(due.penalty) || 0).toLocaleString('en-IN'), pageWidth - 40, y + 32, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  
  if (due.daysOverdue > 0) {
    doc.setTextColor(...ERROR_COLOR);
    doc.setFontSize(8);
    doc.text('Days Overdue: ' + due.daysOverdue, 20, y + 44);
    doc.setTextColor(0, 0, 0);
  }
  
  doc.setDrawColor(...BRAND_COLOR);
  doc.line(15, y + 50, pageWidth - 15, y + 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total Due:', 20, y + 64);
  doc.setTextColor(...ERROR_COLOR);
  doc.text('Rs. ' + (Number(due.totalDue) || 0).toLocaleString('en-IN'), pageWidth - 40, y + 64, { align: 'right' });
  
  drawFooter(doc);
  doc.save('DueStatement_' + (due.flatNumber || '') + '.pdf');
}

// =============== GATE PASS PDF ===============
export function generateGatePassPDF(pass) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'VISITOR GATE PASS');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pass ID: ' + (pass.id || 'N/A'), 15, 52);
  
  const isActive = pass.status === 'active';
  doc.setFillColor(...(isActive ? SUCCESS_COLOR : [150, 150, 150]));
  doc.roundedRect(pageWidth - 50, 46, 35, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(isActive ? 'ACTIVE' : 'EXPIRED', pageWidth - 33, 53, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 62, pageWidth - 30, 70, 3, 3);
  
  const details = [
    ['Visitor Name', pass.visitorName || 'N/A'],
    ['Visiting Flat', pass.flatNumber || 'N/A'],
    ['Resident', pass.residentName || 'N/A'],
    ['Purpose', pass.purpose || 'N/A'],
    ['Valid From', pass.validFrom ? new Date(pass.validFrom).toLocaleString('en-IN') : 'N/A'],
    ['Valid Until', pass.validUntil ? new Date(pass.validUntil).toLocaleString('en-IN') : 'N/A'],
  ];
  
  let y = 75;
  details.forEach(([label, value]) => {
    drawInfoRow(doc, label, value, 22, y);
    y += 10;
  });
  
  // QR placeholder
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(1);
  doc.roundedRect(65, 145, 80, 80, 5, 5);
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(10);
  doc.text('QR CODE', pageWidth / 2, 182, { align: 'center' });
  doc.setFontSize(8);
  doc.text(pass.qrCode || 'N/A', pageWidth / 2, 192, { align: 'center' });
  
  drawFooter(doc);
  doc.save('GatePass_' + (pass.id || 'unknown') + '.pdf');
}

// =============== MATERIAL EXIT PASS PDF ===============
export function generateMaterialExitPassPDF(pass) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'MATERIAL EXIT PASS');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pass ID: ' + (pass.id || 'N/A'), 15, 52);
  
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 58, pageWidth - 30, 80, 3, 3);
  
  const details = [
    ['Flat Number', pass.flatNumber || 'N/A'],
    ['Resident', pass.residentName || 'N/A'],
    ['Material', pass.materialDescription || pass.items || 'N/A'],
    ['Quantity', pass.quantity || 'N/A'],
    ['Carrier Name', pass.carrierName || 'N/A'],
    ['Carrier Contact', pass.carrierContact || 'N/A'],
    ['Date', pass.date ? new Date(pass.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
  ];
  
  let y = 72;
  details.forEach(([label, value]) => {
    drawInfoRow(doc, label, String(value).substring(0, 50), 22, y);
    y += 10;
  });
  
  // Authorization
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Authorization', 15, 160);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 163, pageWidth - 15, 163);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Resident Signature: ___________________', 15, 185);
  doc.text('Security Signature: ___________________', 115, 185);
  
  drawFooter(doc);
  doc.save('MaterialExitPass_' + (pass.id || 'unknown') + '.pdf');
}

// =============== FINANCIAL REPORT PDF ===============
export function generateFinancialReportPDF(data) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'FINANCIAL REPORT', 'Generated: ' + new Date().toLocaleDateString('en-IN'));
  
  // Summary cards
  let y = 58;
  doc.setFillColor(240, 255, 240);
  doc.roundedRect(15, y, 55, 25, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Total Income', 20, y + 10);
  doc.setTextColor(...SUCCESS_COLOR);
  doc.setFontSize(12);
  doc.text('Rs. ' + (data.totalIncome || 0).toLocaleString('en-IN'), 20, y + 20);
  
  doc.setFillColor(255, 240, 240);
  doc.roundedRect(78, y, 55, 25, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text('Total Expenses', 83, y + 10);
  doc.setTextColor(...ERROR_COLOR);
  doc.setFontSize(12);
  doc.text('Rs. ' + (data.totalExpenses || 0).toLocaleString('en-IN'), 83, y + 20);
  
  doc.setFillColor(240, 238, 255);
  doc.roundedRect(141, y, 55, 25, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text('Net Balance', 146, y + 10);
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(12);
  doc.text('Rs. ' + (data.netBalance || 0).toLocaleString('en-IN'), 146, y + 20);
  
  // Income breakdown
  doc.setTextColor(0, 0, 0);
  y = 95;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Income Breakdown', 15, y);
  y += 5;
  
  if (data.collections) {
    Object.entries(data.collections).forEach(([key, value]) => {
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(key.charAt(0).toUpperCase() + key.slice(1), 20, y);
      doc.text('Rs. ' + (value || 0).toLocaleString('en-IN'), 100, y, { align: 'right' });
    });
  }
  
  // Expense breakdown
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Expense Breakdown', 15, y);
  y += 5;
  
  if (data.expenses) {
    Object.entries(data.expenses).forEach(([key, value]) => {
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(key.charAt(0).toUpperCase() + key.slice(1), 20, y);
      doc.text('Rs. ' + (value || 0).toLocaleString('en-IN'), 100, y, { align: 'right' });
    });
  }
  
  // Monthly trend
  if (data.monthlyTrend) {
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Monthly Trend', 15, y);
    y += 8;
    
    const headers = ['Month', 'Income', 'Expense', 'Net'];
    const rows = data.monthlyTrend.map(m => [
      m.month, 
      'Rs. ' + (m.income || 0).toLocaleString('en-IN'),
      'Rs. ' + (m.expense || 0).toLocaleString('en-IN'),
      'Rs. ' + ((m.income || 0) - (m.expense || 0)).toLocaleString('en-IN'),
    ]);
    drawTable(doc, headers, rows, y, [30, 45, 45, 45]);
  }
  
  drawFooter(doc);
  doc.save('FinancialReport_' + new Date().toISOString().split('T')[0] + '.pdf');
}

// =============== GENERIC REPORT PDF ===============
export function generateReportPDF(title, data, columns) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, title.toUpperCase(), 'Total Records: ' + data.length + ' | ' + new Date().toLocaleDateString('en-IN'));
  
  const headers = columns.map(c => c.label);
  const rows = data.map(row => columns.map(c => String(row[c.key] || 'N/A')));
  const colWidth = (pageWidth - 30) / columns.length;
  
  drawTable(doc, headers, rows, 58, columns.map(() => colWidth));
  
  drawFooter(doc);
  doc.save(title.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.pdf');
}

// =============== VENDOR PAYMENT RECEIPT PDF ===============
export function generateVendorPaymentReceiptPDF(payment) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  drawHeader(doc, 'VENDOR PAYMENT RECEIPT');
  
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(15, 52, pageWidth - 30, 40, 3, 3);
  drawInfoRow(doc, 'Payment ID', (payment.id || 'N/A').substring(0, 20), 20, 64);
  drawInfoRow(doc, 'Date', payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 120, 64);
  drawInfoRow(doc, 'Invoice No', payment.invoiceNumber || 'N/A', 20, 76);
  drawInfoRow(doc, 'Method', payment.paymentMethod || 'N/A', 120, 76);
  
  // Vendor details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Paid To:', 15, 108);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Vendor: ' + (payment.vendorName || 'N/A'), 15, 118);
  doc.text('Service: ' + (payment.serviceType || 'N/A'), 15, 127);
  
  // Amount
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(15, 136, pageWidth - 15, 136);
  
  doc.setFillColor(240, 238, 255);
  doc.rect(15, 140, pageWidth - 30, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Description', 20, 147);
  doc.text('Amount', pageWidth - 40, 147, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text((payment.serviceType || 'Vendor Service') + ' Payment', 20, 160);
  const amt = Number(payment.amount) || 0;
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 160, { align: 'right' });
  
  doc.line(15, 166, pageWidth - 15, 166);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Paid:', 20, 178);
  doc.setTextColor(...SUCCESS_COLOR);
  doc.text('Rs. ' + amt.toLocaleString('en-IN'), pageWidth - 40, 178, { align: 'right' });
  
  doc.setFillColor(...SUCCESS_COLOR);
  doc.roundedRect(15, 186, 25, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('PAID', 20, 192);
  
  drawFooter(doc);
  doc.save('VendorReceipt_' + (payment.vendorName || 'unknown').replace(/\s+/g, '_') + '_' + (payment.id || '').substring(0, 8) + '.pdf');
}


// =============== CSV EXPORT ===============
export function exportCSV(data, columns, filename) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = String(row[c.key] || '');
      return val.includes(',') || val.includes('"') ? '"' + val.replace(/"/g, '""') + '"' : val;
    }).join(',')
  );
  
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename + '_' + new Date().toISOString().split('T')[0] + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
