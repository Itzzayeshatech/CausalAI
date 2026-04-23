const axios = require('axios');

const analyzeRootCause = async (payload) => {
  const url = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';
  const response = await axios.post(url, { type: 'root-cause', ...payload });
  return response.data;
};

const analyzeWhatIf = async (payload) => {
  const url = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';
  const response = await axios.post(url, { type: 'what-if', ...payload });
  return response.data;
};

module.exports = { analyzeRootCause, analyzeWhatIf };
