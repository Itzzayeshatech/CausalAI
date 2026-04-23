const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

const parseCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    // Ensure we have an absolute path
    const absolutePath = path.resolve(filePath);
    
    // Check if file exists before trying to read
    if (!fs.existsSync(absolutePath)) {
      return reject(new Error(`File not found: ${absolutePath}`));
    }
    
    fs.createReadStream(absolutePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
};

const parseExcelFile = (filePath) => {
  // Ensure we have an absolute path
  const absolutePath = path.resolve(filePath);
  
  // Check if file exists before trying to read
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  
  const workbook = xlsx.readFile(absolutePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: null });
};

const parseDatasetFile = async (filePath, mimetype) => {
  if (mimetype === 'text/csv') {
    return await parseCsvFile(filePath);
  }

  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return parseExcelFile(filePath);
  }

  throw new Error('Unsupported file format');
};

const createMeta = (rows) => {
  const sample = rows.slice(0, 5);
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return {
    rowCount: rows.length,
    columns,
    sample
  };
};

module.exports = { parseDatasetFile, createMeta };
