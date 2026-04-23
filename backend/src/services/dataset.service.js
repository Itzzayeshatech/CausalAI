const Dataset = require('../models/Dataset');
const { parseDatasetFile, createMeta } = require('../utils/dataPipeline');
const fs = require('fs');
const path = require('path');

class DatasetService {
    static async createDataset(userId, datasetData) {
        try {
            const { name, description, fileName, fileType, fileSize, filePath } = datasetData;
            
            // Parse dataset to extract metadata
            const rows = await parseDatasetFile(filePath, fileType);
            const meta = createMeta(rows);
            
            const dataset = new Dataset({
                user: userId,
                name,
                description,
                fileName,
                fileType,
                fileSize,
                filePath,
                meta,
                uploadDate: new Date()
            });
            
            return await dataset.save();
        } catch (error) {
            throw new Error(`Dataset creation failed: ${error.message}`);
        }
    }
    
    static async getUserDatasets(userId, page = 1, limit = 10, sortBy = 'uploadDate', sortOrder = -1) {
        try {
            const skip = (page - 1) * limit;
            const datasets = await Dataset.find({ user: userId })
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .exec();
            
            const total = await Dataset.countDocuments({ user: userId });
            
            return {
                datasets,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: skip + limit < total
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch datasets: ${error.message}`);
        }
    }
    
    static async getDatasetById(datasetId, userId) {
        try {
            const dataset = await Dataset.findOne({ 
                _id: datasetId, 
                user: userId 
            }).populate('user', 'name email');
            
            if (!dataset) {
                throw new Error('Dataset not found');
            }
            
            return dataset;
        } catch (error) {
            throw new Error(`Failed to fetch dataset: ${error.message}`);
        }
    }
    
    static async updateDataset(datasetId, userId, updateData) {
        try {
            const dataset = await Dataset.findOne({ 
                _id: datasetId, 
                user: userId 
            });
            
            if (!dataset) {
                throw new Error('Dataset not found');
            }
            
            Object.assign(dataset, updateData);
            dataset.updatedAt = new Date();
            
            return await dataset.save();
        } catch (error) {
            throw new Error(`Dataset update failed: ${error.message}`);
        }
    }
    
    static async deleteDataset(datasetId, userId) {
        try {
            const dataset = await Dataset.findOne({ 
                _id: datasetId, 
                user: userId 
            });
            
            if (!dataset) {
                throw new Error('Dataset not found');
            }
            
            // Delete physical file
            if (dataset.filePath && fs.existsSync(dataset.filePath)) {
                fs.unlinkSync(dataset.filePath);
            }
            
            // Delete database record
            await Dataset.deleteOne({ _id: datasetId });
            
            return { success: true, message: 'Dataset deleted successfully' };
        } catch (error) {
            throw new Error(`Dataset deletion failed: ${error.message}`);
        }
    }
    
    static async getDatasetStats(userId) {
        try {
            const stats = await Dataset.aggregate([
                { $match: { user: userId } },
                {
                    $group: {
                        _id: null,
                        totalDatasets: { $sum: 1 },
                        totalSize: { $sum: '$fileSize' },
                        totalRows: { $sum: '$meta.rowCount' },
                        avgSize: { $avg: '$fileSize' },
                        avgRows: { $avg: '$meta.rowCount' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalDatasets: 1,
                        totalSize: 1,
                        totalRows: 1,
                        avgSize: { $round: ['$avgSize', 0] },
                        avgRows: { $round: ['$avgRows', 0] }
                    }
                }
            ]);
            
            return stats[0] || {
                totalDatasets: 0,
                totalSize: 0,
                totalRows: 0,
                avgSize: 0,
                avgRows: 0
            };
        } catch (error) {
            throw new Error(`Failed to get dataset stats: ${error.message}`);
        }
    }
    
    static async validateDatasetFile(filePath, fileType) {
        try {
            const stats = fs.statSync(filePath);
            
            // Check file size (max 50MB)
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (stats.size > maxSize) {
                throw new Error('File size exceeds 50MB limit');
            }
            
            // Check file type
            const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!allowedTypes.includes(fileType)) {
                throw new Error('Invalid file type. Only CSV and Excel files are allowed');
            }
            
            // Parse a few rows to validate structure
            const rows = await parseDatasetFile(filePath, fileType);
            if (rows.length === 0) {
                throw new Error('File appears to be empty or invalid');
            }
            
            if (rows.length < 10) {
                throw new Error('Dataset must contain at least 10 rows');
            }
            
            const columns = Object.keys(rows[0]);
            if (columns.length < 2) {
                throw new Error('Dataset must contain at least 2 columns');
            }
            
            // Check for numeric columns
            const numericColumns = rows[0] ? 
                Object.keys(rows[0]).filter(col => 
                    rows.some(row => !isNaN(parseFloat(row[col])) && row[col] !== ''
                )
                ) : [];
            
            if (numericColumns.length === 0) {
                throw new Error('Dataset must contain at least 1 numeric column for analysis');
            }
            
            return {
                valid: true,
                rows: rows.length,
                columns: columns.length,
                numericColumns: numericColumns.length,
                suggestedTargetColumns: numericColumns
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
}

module.exports = DatasetService;
