const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

class DataPipeline {
  static async parseDatasetFile(filePath, fileType) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      if (fileType === 'text/csv') {
        return await this._parseCsv(filePath);
      }

      if (
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        return this._parseExcel(filePath);
      }

      throw new Error('Unsupported file format');
    } catch (error) {
      throw new Error(`Failed to parse dataset: ${error.message}`);
    }
  }

  static async _parseCsv(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  static _parseExcel(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with proper handling of empty cells
      const jsonData = xlsx.utils.sheet_to_json(sheet, {
        defval: null,
        blankrows: false
      });
      
      return jsonData;
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  }

  static createMeta(rows) {
    if (!rows || rows.length === 0) {
      return {
        columns: [],
        rowCount: 0,
        sample: []
      };
    }

    const sample = rows.slice(0, 5).map(row => {
      const cleanedRow = {};
      Object.keys(row).forEach(key => {
        let value = row[key];
        if (typeof value === 'number' && !isNaN(value)) {
          cleanedRow[key] = Number(value.toFixed(2));
        } else {
          cleanedRow[key] = value;
        }
      });
      return cleanedRow;
    });

    return {
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      rowCount: rows.length,
      sample
    };
  }

  static validateDataset(rows) {
    if (!rows || rows.length === 0) {
      return {
        isValid: false,
        errors: ['Dataset is empty']
      };
    }

    if (rows.length < 10) {
      return {
        isValid: false,
        errors: ['Dataset must contain at least 10 rows']
      };
    }

    const columns = Object.keys(rows[0]);
    if (columns.length < 2) {
      return {
        isValid: false,
        errors: ['Dataset must contain at least 2 columns']
      };
    }

    // Check for numeric columns
    let numericColumns = [];
    if (rows[0]) {
      numericColumns = Object.keys(rows[0]).filter(col => 
        rows.some(row => !isNaN(parseFloat(row[col])) && row[col] !== '')
      );
    }

    if (numericColumns.length === 0) {
      return {
        isValid: false,
        errors: ['Dataset must contain at least 1 numeric column for analysis']
      };
    }

    return {
      isValid: true,
      numericColumns,
      totalColumns: columns.length
    };
  }
}

module.exports = DataPipeline;
