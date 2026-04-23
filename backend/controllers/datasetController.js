const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const { parseDatasetFile, createMeta } = require('../services/fileService');

const uploadDataset = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No dataset file uploaded' });
  }

  const filePath = req.file.path;
  const fileType = req.file.mimetype;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const name = req.body.name || fileName;
  const description = req.body.description || '';

  const rows = await parseDatasetFile(filePath, fileType);
  const meta = createMeta(rows);

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

  res.status(201).json({ message: 'Dataset uploaded', dataset });
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
