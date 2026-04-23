const Dataset = require('../models/Dataset');
const AnalysisHistory = require('../models/AnalysisHistory');
const { parseDatasetFile } = require('../services/fileService');
const { analyzeRootCause, analyzeWhatIf } = require('../services/aiService');

const getAnalysisHistory = async (req, res) => {
  const history = await AnalysisHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(history);
};

const rootCauseAnalysis = async (req, res) => {
  const { datasetId, targetColumn, periodField, notes } = req.body;
  const dataset = await Dataset.findById(datasetId);
  if (!dataset || dataset.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Dataset not found' });
  }

  const rows = await parseDatasetFile(dataset.filePath, dataset.fileType);
  const payload = { datasetName: dataset.name, rows, targetColumn, periodField, notes };
  const result = await analyzeRootCause(payload);

  const history = await AnalysisHistory.create({
    user: req.user._id,
    dataset: dataset._id,
    type: 'root-cause',
    query: `Analyse root cause for ${targetColumn}`,
    result
  });

  res.json({ result, historyId: history._id });
};

const whatIfAnalysis = async (req, res) => {
  const { datasetId, changes, targetColumn, scenarioName, notes } = req.body;
  const dataset = await Dataset.findById(datasetId);
  if (!dataset || dataset.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Dataset not found' });
  }

  const rows = await parseDatasetFile(dataset.filePath, dataset.fileType);
  const payload = { datasetName: dataset.name, rows, targetColumn, changes, scenarioName, notes };
  const result = await analyzeWhatIf(payload);

  const history = await AnalysisHistory.create({
    user: req.user._id,
    dataset: dataset._id,
    type: 'what-if',
    query: `Simulate ${scenarioName || 'scenario'}`,
    result
  });

  res.json({ result, historyId: history._id });
};

module.exports = { getAnalysisHistory, rootCauseAnalysis, whatIfAnalysis };
