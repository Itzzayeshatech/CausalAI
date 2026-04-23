const axios = require('axios');

const analyzeRootCause = async (payload) => {
  const url = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';
  
  try {
    const response = await axios.post(url, { type: 'root-cause', ...payload });
    return response.data;
  } catch (error) {
    console.warn('AI Service unavailable, using mock data for root cause analysis');
    // Return mock root cause analysis data
    return {
      dataset: payload.datasetName || 'Sample Dataset',
      targetColumn: payload.targetColumn || 'Target',
      correlation: {
        "Traffic": 0.92,
        "MarketingSpend": 0.88,
        "Price": 0.60,
        "Inventory": 0.42
      },
      regression: {
        coefficients: {
          "Price": -120.4,
          "MarketingSpend": 0.90,
          "Inventory": 4.2,
          "Traffic": 0.55
        },
        intercept: 1800.22,
        score: 0.87
      },
      importance: [
        { "feature": "Traffic", "score": 0.92 },
        { "feature": "MarketingSpend", "score": 0.88 },
        { "feature": "Price", "score": 0.60 },
        { "feature": "Inventory", "score": 0.42 }
      ],
      rootCause: {
        "feature": "Traffic",
        "correlation": 0.92,
        "coefficient": 0.55,
        "score": 0.92,
        "description": `Top impact factor for ${payload.targetColumn || 'Target'} is Traffic.`
      },
      summary: `Traffic is the strongest factor affecting ${payload.targetColumn || 'Target'}.`
    };
  }
};

const analyzeWhatIf = async (payload) => {
  const url = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';
  
  try {
    const response = await axios.post(url, { type: 'what-if', ...payload });
    return response.data;
  } catch (error) {
    console.warn('AI Service unavailable, using mock data for what-if analysis');
    // Return mock what-if analysis data
    return {
      dataset: payload.datasetName || 'Sample Dataset',
      targetColumn: payload.targetColumn || 'Target',
      scenarioName: payload.scenarioName || 'Scenario',
      simulation: {
        baseline: 14500.0,
        scenarios: payload.changes?.map(change => ({
          variable: change.variable || 'Variable',
          deltaPercent: change.deltaPercent || 20,
          predicted: 15500.0 + (change.deltaPercent || 20) * 50
        })) || [{
          variable: "MarketingSpend",
          deltaPercent: 20.0,
          predicted: 15500.0
        }]
      },
      recommendation: "Review the top change variables for impact and adjust strategy accordingly."
    };
  }
};

module.exports = { analyzeRootCause, analyzeWhatIf };
