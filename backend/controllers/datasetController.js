const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const DataPipeline = require('../utils/dataPipeline');

const uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No dataset file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const name = req.body.name || fileName;
    const description = req.body.description || '';

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: 'File not found on server' });
    }

    // Parse file using new data pipeline
    const rows = await DataPipeline.parseDatasetFile(filePath, fileType);
    const meta = DataPipeline.createMeta(rows);

    // Create dataset record
    const dataset = await Dataset.create({
      user: req.user._id,
      name,
      description,
      fileName,
      fileType,
      fileSize,
      filePath,
      meta
    });

    res.status(201).json({ 
      message: 'Dataset uploaded successfully', 
      dataset: {
        id: dataset._id,
        name: dataset.name,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        rowCount: dataset.meta.rowCount,
        columns: dataset.meta.columns
      }
    });
  } catch (error) {
    console.error('Dataset upload error:', error);
    res.status(500).json({ 
      message: 'Dataset upload failed', 
      error: error.message 
    });
  }
};

const listDatasets = async (req, res) => {
  const datasets = await Dataset.find({ user: req.user._id }).sort({ uploadDate: -1 });
  res.json(datasets);
};

const deleteDataset = async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);
  if (!dataset || dataset.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Dataset not found' });
  }
  await dataset.deleteOne();
  if (dataset.filePath) {
    try {
      fs.unlinkSync(dataset.filePath);
    } catch (err) {
      console.warn('Unable to delete dataset file:', err.message);
    }
  }
  res.json({ message: 'Dataset deleted' });
};

module.exports = { uploadDataset, listDatasets, deleteDataset };
