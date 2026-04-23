const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset'
  },
  type: {
    type: String,
    enum: ['root-cause', 'what-if'],
    required: true
  },
  query: {
    type: String,
    trim: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

analysisHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AnalysisHistory', analysisHistorySchema);
