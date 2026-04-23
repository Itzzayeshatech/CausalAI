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

            let rows;
            
            switch (fileType) {
                case 'text/csv':
                    rows = await this._parseCsv(filePath);
                    break;
                case 'application/vnd.ms-excel':
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    rows = this._parseExcel(filePath);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }

            // Data validation
            const validatedData = this._validateAndCleanData(rows);
            
            return validatedData;
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
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON with proper handling of empty cells
            const jsonData = xlsx.utils.sheet_to_json(worksheet, {
                defval: null,
                blankrows: false
            });
            
            return jsonData;
        } catch (error) {
            throw new Error(`Excel parsing failed: ${error.message}`);
        }
    }

    static _validateAndCleanData(rows) {
        if (!rows || rows.length === 0) {
            throw new Error('Dataset is empty');
        }

        // Remove empty rows
        const cleanRows = rows.filter(row => {
            const hasData = Object.values(row).some(value => 
                value !== null && value !== undefined && value !== ''
            );
            return hasData;
        });

        if (cleanRows.length < 10) {
            throw new Error('Dataset must contain at least 10 valid rows');
        }

        // Get column information
        const columns = Object.keys(cleanRows[0]);
        const numericColumns = this._identifyNumericColumns(cleanRows);
        
        if (numericColumns.length === 0) {
            throw new Error('Dataset must contain at least 1 numeric column');
        }

        // Clean and normalize data
        const normalizedRows = cleanRows.map(row => {
            const normalizedRow = {};
            
            columns.forEach(col => {
                const value = row[col];
                
                if (numericColumns.includes(col)) {
                    // Convert to number, handle various formats
                    normalizedRow[col] = this._parseNumeric(value);
                } else {
                    // Clean string values
                    normalizedRow[col] = this._parseString(value);
                }
            });
            
            return normalizedRow;
        });

        return {
            rows: normalizedRows,
            columns,
            numericColumns,
            rowCount: normalizedRows.length,
            columnStats: this._calculateColumnStats(normalizedRows, numericColumns)
        };
    }

    static _identifyNumericColumns(rows) {
        if (!rows || rows.length === 0) return [];

        const numericColumns = [];
        const sampleSize = Math.min(rows.length, 100); // Sample first 100 rows

        Object.keys(rows[0]).forEach(col => {
            let numericCount = 0;
            let totalCount = 0;

            for (let i = 0; i < sampleSize; i++) {
                const value = rows[i][col];
                totalCount++;
                
                if (this._isNumeric(value)) {
                    numericCount++;
                }
            }

            // If more than 80% of non-null values are numeric, consider it numeric
            if ((numericCount / totalCount) > 0.8) {
                numericColumns.push(col);
            }
        });

        return numericColumns;
    }

    static _parseNumeric(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        // Remove common formatting characters
        const cleanValue = String(value).replace(/[$,%]/g, '').trim();
        
        // Handle scientific notation and large numbers
        if (cleanValue.includes('e') || cleanValue.includes('E')) {
            const parsed = parseFloat(cleanValue);
            return isNaN(parsed) ? null : parsed;
        }

        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? null : parsed;
    }

    static _parseString(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value).trim();
    }

    static _isNumeric(value) {
        if (value === null || value === undefined || value === '') {
            return false;
        }

        const cleanValue = String(value).replace(/[$,%]/g, '').trim();
        
        // Check for numeric patterns
        return !isNaN(parseFloat(cleanValue)) && 
               !isNaN(cleanValue) && 
               isFinite(cleanValue);
    }

    static _calculateColumnStats(rows, numericColumns) {
        const stats = {};

        numericColumns.forEach(col => {
            const values = rows
                .map(row => row[col])
                .filter(val => val !== null && !isNaN(val));

            if (values.length > 0) {
                stats[col] = {
                    min: Math.min(...values),
                    max: Math.max(...values),
                    mean: values.reduce((sum, val) => sum + val, 0) / values.length,
                    median: this._calculateMedian(values),
                    stdDev: this._calculateStandardDeviation(values),
                    nullCount: rows.length - values.length
                };
            }
        });

        return stats;
    }

    static _calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            return sorted[mid];
        }
    }

    static _calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }

    static createMeta(data) {
        if (!data || !data.rows) {
            return {
                columns: [],
                rowCount: 0,
                numericColumns: [],
                sample: []
            };
        }

        const sample = data.rows.slice(0, 5).map(row => {
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
            columns: data.columns || [],
            rowCount: data.rowCount || 0,
            numericColumns: data.numericColumns || [],
            columnStats: data.columnStats || {},
            sample
        };
    }

    static async preprocessForML(data, targetColumn) {
        try {
            // Remove rows with missing target values
            const cleanData = data.rows.filter(row => 
                row[targetColumn] !== null && 
                !isNaN(row[targetColumn]) && 
                row[targetColumn] !== undefined
            );

            if (cleanData.length < 10) {
                throw new Error('Insufficient valid data for ML analysis');
            }

            // Feature engineering suggestions
            const featureSuggestions = this._generateFeatureSuggestions(cleanData, targetColumn);

            return {
                processedData: cleanData,
                featureSuggestions,
                dataQuality: {
                    totalRows: data.rows.length,
                    validRows: cleanData.length,
                    completeness: (cleanData.length / data.rows.length) * 100,
                    missingTargetRows: data.rows.length - cleanData.length
                }
            };
        } catch (error) {
            throw new Error(`Data preprocessing failed: ${error.message}`);
        }
    }

    static _generateFeatureSuggestions(data, targetColumn) {
        const suggestions = [];
        const numericColumns = data.numericColumns || [];

        numericColumns.forEach(col => {
            if (col === targetColumn) return;

            const correlation = this._calculateSimpleCorrelation(data, col, targetColumn);
            
            if (Math.abs(correlation) > 0.7) {
                suggestions.push({
                    feature: col,
                    type: 'strong_correlation',
                    correlation,
                    suggestion: `Strong correlation with ${targetColumn} (${correlation.toFixed(3)})`
                });
            } else if (Math.abs(correlation) > 0.5) {
                suggestions.push({
                    feature: col,
                    type: 'moderate_correlation',
                    correlation,
                    suggestion: `Moderate correlation with ${targetColumn} (${correlation.toFixed(3)})`
                });
            }
        });

        return suggestions.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    }

    static _calculateSimpleCorrelation(data, col1, col2) {
        const values1 = data.map(row => row[col1]).filter(val => val !== null && !isNaN(val));
        const values2 = data.map(row => row[col2]).filter(val => val !== null && !isNaN(val));

        if (values1.length !== values2.length || values1.length === 0) {
            return 0;
        }

        const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
        const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

        let numerator = 0;
        let denom1 = 0;
        let denom2 = 0;

        for (let i = 0; i < values1.length; i++) {
            const diff1 = values1[i] - mean1;
            const diff2 = values2[i] - mean2;
            numerator += diff1 * diff2;
            denom1 += diff1 * diff1;
            denom2 += diff2 * diff2;
        }

        const denominator = Math.sqrt(denom1 * denom2);
        
        if (denominator === 0) return 0;
        
        return numerator / denominator;
    }
}

module.exports = DataPipeline;
