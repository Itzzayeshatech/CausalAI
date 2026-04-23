import { useEffect, useState } from 'react';
import { Database, TrendingUp, Users, BarChart3, Activity, Target } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import KPICard from '../components/dashboard/KPICard';
import InsightPanel from '../components/dashboard/InsightPanel';
import AdvancedChart from '../components/dashboard/AdvancedChart';

const DashboardPage = ({ showToast }) => {
  const [datasets, setDatasets] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch datasets
        const datasetsResponse = await api.get('/datasets');
        const datasetsData = datasetsResponse.data || [];
        setDatasets(datasetsData);

        // Fetch recent analyses
        const analysesResponse = await api.get('/analysis/history');
        const analysesData = analysesResponse.data || [];
        setAnalyses(analysesData.slice(0, 10));

        // Calculate KPIs
        const kpis = calculateKPIs(datasetsData, analysesData);
        setInsights(kpis);

      } catch (error) {
        showToast('Unable to load dashboard data', 'error');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const calculateKPIs = (datasets, analyses) => {
    const totalDatasets = datasets.length;
    const totalAnalyses = analyses.length;
    const avgDatasetSize = datasets.length > 0 
      ? Math.round(datasets.reduce((sum, d) => sum + (d.fileSize || 0), 0) / datasets.length / 1024)
      : 0;
    
    // Get insights from most recent analysis
    const recentInsights = analyses.length > 0 ? analyses[0].result?.insights : null;

    return {
      totalDatasets,
      totalAnalyses,
      avgDatasetSize,
      recentInsights
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Prepare chart data with safe number handling
  const datasetSizeData = datasets.slice(0, 8).map(dataset => ({
    name: dataset.name ? dataset.name.substring(0, 15) + (dataset.name.length > 15 ? '...' : '') : 'Unknown',
    size: Math.round((dataset.fileSize || 0) / 1024) || 0,
    rows: (dataset.meta?.rowCount || 0) || 0
  }));

  const analysisTrendData = analyses.slice(0, 10).map((analysis, index) => ({
    date: analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : `Day ${index + 1}`,
    analyses: index + 1,
    type: analysis.type || 'unknown'
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CausalAI Analytics</h1>
              <p className="text-slate-400 mt-1">Production-grade business intelligence platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                New Analysis
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Datasets"
            value={insights?.totalDatasets || 0}
            change={"+12%"}
            changeType="increase"
            icon={Database}
            color="blue"
            description="Active datasets"
          />
          <KPICard
            title="Total Analyses"
            value={insights?.totalAnalyses || 0}
            change={"+8%"}
            changeType="increase"
            icon={BarChart3}
            color="green"
            description="Completed analyses"
          />
          <KPICard
            title="Avg Dataset Size"
            value={`${insights?.avgDatasetSize || 0} KB`}
            change={"+5%"}
            changeType="increase"
            icon={Activity}
            color="purple"
            description="Average file size"
          />
          <KPICard
            title="Active Users"
            value="1"
            change="0%"
            changeType="neutral"
            icon={Users}
            color="orange"
            description="Current users"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dataset Sizes Chart */}
            <AdvancedChart
              type="bar"
              title="Dataset Sizes"
              subtitle="File sizes in KB"
              data={datasetSizeData}
              xKey="name"
              yKey="size"
              height={300}
            />

            {/* Analysis Trend Chart */}
            <AdvancedChart
              type="line"
              title="Analysis Activity"
              subtitle="Analyses over time"
              data={analysisTrendData}
              xKey="date"
              yKey="analyses"
              height={250}
            />
          </div>

          {/* Insights Panel */}
          <div className="space-y-8">
            <InsightPanel
              insights={insights?.recentInsights}
              loading={false}
            />
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyses.slice(0, 5).map((analysis, index) => (
                  <tr key={analysis._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {analysis.dataset?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {analysis.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(analysis.createdAt).toLocaleDateString()}
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
    </div>
  );
};

export default DashboardPage;
