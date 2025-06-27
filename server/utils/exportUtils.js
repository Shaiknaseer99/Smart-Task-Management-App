const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const XLSX = require('xlsx');

async function exportToCSV(tasks) {
  const csvWriter = createCsvWriter({
    header: [
      { id: 'title', title: 'Title' },
      { id: 'description', title: 'Description' },
      { id: 'category', title: 'Category' },
      { id: 'status', title: 'Status' },
      { id: 'priority', title: 'Priority' },
      { id: 'dueDate', title: 'Due Date' },
      { id: 'createdAt', title: 'Created At' }
    ]
  });
  return csvWriter.getHeaderString() + csvWriter.stringifyRecords(tasks.map(task => ({
    ...task.toObject(),
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt?.toISOString()
  })));
}

function  exportToExcel (tasks, res)  {
  const worksheet = XLSX.utils.json_to_sheet(tasks);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="tasks.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

async function exportToPDF(tasks, user) {
  const doc = new PDFDocument();
  const bufferStream = new stream.PassThrough();
  doc.pipe(bufferStream);
  doc.fontSize(18).text('Task List', { align: 'center' });
  doc.moveDown();
  tasks.forEach(task => {
    doc.fontSize(12).text(`Title: ${task.title}`);
    doc.text(`Description: ${task.description}`);
    doc.text(`Category: ${task.category}`);
    doc.text(`Status: ${task.status}`);
    doc.text(`Priority: ${task.priority}`);
    doc.text(`Due Date: ${task.dueDate?.toISOString()}`);
    doc.text(`Created At: ${task.createdAt?.toISOString()}`);
    doc.moveDown();
  });
  doc.end();
  const chunks = [];
  return new Promise((resolve, reject) => {
    bufferStream.on('data', chunk => chunks.push(chunk));
    bufferStream.on('end', () => resolve(Buffer.concat(chunks)));
    bufferStream.on('error', reject);
  });
}

module.exports = { exportToCSV, exportToExcel, exportToPDF }; 