import React, { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Target, BarChart3 } from 'lucide-react';

const InsightPanel = ({ insights, loading }) => {
  const [activeTab, setActiveTab] = useState('correlations');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No insights available</p>
          <p className="text-sm mt-2">Upload a dataset and run analysis to see AI-powered insights</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'correlations', label: 'Key Drivers', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'correlations':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Top Business Drivers</h4>
            {insights.correlation_insights?.map((insight, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-800">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Actionable Recommendations</h4>
            {insights.recommendations?.map((rec, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Target className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800 font-medium">{rec}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">AI-Generated Insights</h4>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-800">{insights.insight}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
            {insights.risk_factors?.map((risk, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-800">{risk}</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Lightbulb className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights Engine</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {renderTabContent()}
      </div>

      {/* Opportunities Section */}
      {insights.opportunities?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Business Opportunities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.opportunities.map((opportunity, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-800 text-sm">{opportunity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightPanel;
