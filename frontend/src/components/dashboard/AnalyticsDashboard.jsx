import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Database, 
  Activity,
  Target,
  Filter,
  Download,
  Settings,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Zap
} from 'lucide-react';
import AdvancedChart from './AdvancedChart';
import KPICard from './KPICard';
import InsightPanel from './InsightPanel';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kpis, setKPIs] = useState({});
  const [insights, setInsights] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in production, this would come from API
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setKPIs({
        totalDatasets: 156,
        totalAnalyses: 1247,
        activeUsers: 89,
        avgProcessingTime: '2.3s',
        dataQualityScore: 94.2,
        modelAccuracy: 87.5
      });
      
      setChartData([
        { date: 'Jan 1', analyses: 45, accuracy: 89.2 },
        { date: 'Jan 2', analyses: 67, accuracy: 91.1 },
        { date: 'Jan 3', analyses: 89, accuracy: 87.6 },
        { date: 'Jan 4', analyses: 123, accuracy: 92.3 },
        { date: 'Jan 5', analyses: 98, accuracy: 88.9 },
        { date: 'Jan 6', analyses: 156, accuracy: 90.1 },
        { date: 'Jan 7', analyses: 134, accuracy: 91.8 },
      ]);
      
      setInsights({
        executiveSummary: "Q1 2024 shows 23% increase in analysis volume with 89% average model accuracy. Key drivers identified: Customer Engagement (0.87 correlation) and Marketing Spend (0.79 correlation).",
        keyDrivers: [
          { feature: 'Customer Engagement', importance: 0.87, correlation: 0.87, impact: 'High' },
          { feature: 'Marketing Spend', importance: 0.79, correlation: 0.79, impact: 'High' },
          { feature: 'Product Quality', importance: 0.65, correlation: 0.65, impact: 'Medium' },
          { feature: 'Seasonal Trends', importance: 0.58, correlation: 0.58, impact: 'Medium' }
        ],
        recommendations: [
          "Prioritize Customer Engagement optimization - shows strongest positive correlation with revenue",
          "Increase Marketing Spend budget by 15% for maximum ROI",
          "Implement real-time Product Quality monitoring system",
          "Develop seasonal demand forecasting models",
          "Create automated alerting for KPI thresholds"
        ],
        risks: [
          "Model accuracy drops below 85% during peak seasons",
          "Data quality degradation in source systems",
          "Increased processing time with larger datasets (>100K rows)"
        ],
        opportunities: [
          "Expand analysis to include customer segmentation",
          "Implement predictive maintenance for key equipment",
          "Develop real-time dashboard for operational metrics",
          "Create API for external system integration"
        ]
      });
      
      setLoading(false);
    }, 1000);

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const datasets = [
    { id: '1', name: 'Customer Analytics Q1', rows: 125000, accuracy: 89.2, lastUpdated: '2024-01-15' },
    { id: '2', name: 'Sales Performance 2024', rows: 89000, accuracy: 91.8, lastUpdated: '2024-01-14' },
    { id: '3', name: 'Marketing Campaign Analysis', rows: 45000, accuracy: 87.6, lastUpdated: '2024-01-13' },
    { id: '4', name: 'Product Quality Metrics', rows: 67000, accuracy: 88.9, lastUpdated: '2024-01-12' },
    { id: '5', name: 'Operational Efficiency', rows: 34000, accuracy: 90.1, lastUpdated: '2024-01-11' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Datasets"
          value={kpis.totalDatasets}
          change="+12%"
          changeType="increase"
          icon={Database}
          color="blue"
          description="Active datasets"
        />
        <KPICard
          title="Total Analyses"
          value={kpis.totalAnalyses}
          change="+23%"
          changeType="increase"
          icon={BarChart3}
          color="green"
          description="Completed analyses"
        />
        <KPICard
          title="Model Accuracy"
          value={`${kpis.modelAccuracy}%`}
          change="+2.1%"
          changeType="increase"
          icon={Target}
          color="purple"
          description="Average accuracy"
        />
        <KPICard
          title="Active Users"
          value={kpis.activeUsers}
          change="+8%"
          changeType="increase"
          icon={Users}
          color="orange"
          description="Current users"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AdvancedChart
          type="line"
          title="Analysis Volume Trend"
          subtitle="Daily analysis count with accuracy"
          data={chartData}
          xKey="date"
          yKey="analyses"
          height={300}
        />
        <AdvancedChart
          type="bar"
          title="Model Performance"
          subtitle="Accuracy over time"
          data={chartData.map(item => ({ 
            ...item, 
            accuracy: ((item.accuracy || 0) * 100) || 0 
          }))}
          xKey="date"
          yKey="accuracy"
          height={300}
        />
      </div>

      {/* Insights Panel */}
      <div className="mb-8">
        <InsightPanel insights={insights} loading={loading} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Analysis Activity</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dataset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rows
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datasets.slice(0, 5).map((dataset, index) => (
                <tr key={dataset.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Database className="w-4 h-4 text-blue-600 mr-2" />
                      {dataset.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Root Cause
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dataset.rows.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{dataset.accuracy}%</span>
                      <span className="ml-2 text-xs text-gray-500">({dataset.accuracy >= 90 ? 'Excellent' : dataset.accuracy >= 80 ? 'Good' : 'Fair'})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDatasets = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Dataset Management</h3>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white">
          <Database className="w-4 h-4 mr-2" />
          New Dataset
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dataset Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rows
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium">{dataset.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dataset.rows.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(dataset.rows * 0.001 / 1024).toFixed(1)} MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dataset.lastUpdated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      <Filter className="w-4 h-4 mr-1" />
                      Analyze
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Advanced Analytics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Model Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Average R² Score</span>
                <span className="text-lg font-bold text-gray-900">87.5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Best Model</span>
                <span className="text-lg font-bold text-green-600">Random Forest</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Analyses</span>
                <span className="text-lg font-bold text-gray-900">1,247</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Data Processing Pipeline</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Avg Processing Time</span>
                <span className="text-lg font-bold text-gray-900">2.3s</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-bold text-green-600">98.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Data Quality Score</span>
                <span className="text-lg font-bold text-blue-600">94.2/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CausalAI Analytics</h1>
              <p className="text-sm text-gray-600 ml-2">Enterprise-grade Business Intelligence Platform</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Dataset Selector */}
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-gray-500" />
                <select 
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Datasets</option>
                  {datasets.map(dataset => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium text-white">
                  <Zap className="w-4 h-4 mr-1" />
                  Run Analysis
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium text-white">
                  <Download className="w-4 h-4 mr-1" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'datasets', label: 'Datasets', icon: Database },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'insights', label: 'Insights', icon: Lightbulb },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'datasets' && renderDatasets()}
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <InsightPanel insights={insights} loading={false} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
