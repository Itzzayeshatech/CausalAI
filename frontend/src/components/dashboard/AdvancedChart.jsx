import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import ChartErrorBoundary from './ChartErrorBoundary';
import SafeChartWrapper from './SafeChartWrapper';
import FallbackChart from './FallbackChart';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

const AdvancedChart = ({ 
  type, 
  data, 
  title, 
  subtitle,
  xKey, 
  yKey, 
  colors = COLORS,
  height = 300,
  showGrid = true,
  showLegend = true,
  animationDuration = 1000
}) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  // Error handler to detect NaN issues and switch to fallback
  useEffect(() => {
    const handleError = (event) => {
      const message = event.message || event.error?.message || '';
      if (message.includes('NaN') || message.includes('path') || message.includes('Expected number')) {
        setUseFallback(true);
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleError, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleError, true);
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    // Helper function to safely convert to number and handle NaN
    const safeNumber = (value) => {
      if (value === null || value === undefined || value === '') return 0;
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? 0 : num;
    };
    
    // Helper function to safely get xKey value
    const safeXValue = (value) => {
      if (value === null || value === undefined || value === '') return 'Unknown';
      return String(value).trim() || 'Unknown';
    };
    
    // Filter out invalid data items first
    const validData = data.filter(item => item && typeof item === 'object');
    
    // Data preprocessing based on chart type
    switch (type) {
      case 'line':
      case 'area':
        return validData.map(item => {
          const yValue = safeNumber(item[yKey]);
          const xValue = safeXValue(item[xKey]);
          return {
            ...item,
            [yKey]: yValue,
            [xKey]: xValue
          };
        }).filter(item => {
          const yValue = item[yKey];
          return yValue !== null && yValue !== undefined && !isNaN(yValue) && isFinite(yValue);
        });
      
      case 'bar':
        return validData.map(item => {
          const yValue = safeNumber(item[yKey]);
          const xValue = safeXValue(item[xKey]);
          return {
            ...item,
            [yKey]: yValue,
            [xKey]: xValue
          };
        }).filter(item => {
          const yValue = item[yKey];
          return yValue !== null && yValue !== undefined && !isNaN(yValue) && isFinite(yValue);
        });
      
      case 'scatter':
        return validData.map(item => {
          const xValue = safeNumber(item[xKey]);
          const yValue = safeNumber(item[yKey]);
          return {
            ...item,
            x: xValue,
            y: yValue
          };
        }).filter(item => {
          const xValue = item.x;
          const yValue = item.y;
          return xValue !== null && xValue !== undefined && !isNaN(xValue) && isFinite(xValue) &&
                 yValue !== null && yValue !== undefined && !isNaN(yValue) && isFinite(yValue);
        });
      
      case 'pie':
        return validData.map(item => {
          const value = safeNumber(item.value || item[yKey]);
          const name = safeXValue(item.name || item[xKey]);
          return {
            name: name,
            value: value
          };
        }).filter(item => {
          const value = item.value;
          return value !== null && value !== undefined && !isNaN(value) && isFinite(value) && value > 0;
        });
      
      default:
        return validData.map(item => {
          const yValue = safeNumber(item[yKey]);
          const xValue = safeXValue(item[xKey]);
          return {
            ...item,
            [yKey]: yValue,
            [xKey]: xValue
          };
        }).filter(item => {
          const yValue = item[yKey];
          return yValue !== null && yValue !== undefined && !isNaN(yValue) && isFinite(yValue);
        });
    }
  }, [data, type, xKey, yKey]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      
      switch (type) {
        case 'scatter':
          return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
              <p className="font-semibold text-gray-900">{`${xKey}: ${data.x}`}</p>
              <p className="text-gray-600">{`${yKey}: ${data.y}`}</p>
            </div>
          );
        
        case 'pie':
          return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
              <p className="font-semibold text-gray-900">{data.name}</p>
              <p className="text-gray-600">{`Value: ${data.value.toLocaleString()}`}</p>
              <p className="text-gray-500 text-sm">{`${((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}</p>
            </div>
          );
        
        default:
          return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
              <p className="font-semibold text-gray-900">{label || data[xKey]}</p>
              <p className="text-gray-600">{`${yKey}: ${data[yKey]?.toLocaleString()}`}</p>
            </div>
          );
      }
    }
    return null;
  };

  const renderChart = () => {
    // If no valid data, show a message instead of trying to render
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available for chart</p>
          </div>
        </div>
      );
    }

    // Final validation: ensure all data points have valid numeric values
    const sanitizedData = chartData.map(item => {
      const sanitizedItem = { ...item };
      
      // Sanitize all possible numeric fields
      Object.keys(sanitizedItem).forEach(key => {
        const value = sanitizedItem[key];
        if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
          sanitizedItem[key] = 0;
        } else if (typeof value === 'string') {
          const numValue = Number(value);
          if (!isNaN(numValue) && isFinite(numValue)) {
            sanitizedItem[key] = numValue;
          }
        }
      });
      
      return sanitizedItem;
    });

    // Double-check for any remaining invalid data
    const hasInvalidData = sanitizedData.some(item => {
      if (type === 'scatter') {
        return !isFinite(item.x) || !isFinite(item.y);
      } else if (type === 'pie') {
        return !isFinite(item.value) || item.value <= 0;
      } else {
        return !isFinite(item[yKey]);
      }
    });

    if (hasInvalidData) {
      console.warn('Chart contains invalid data after sanitization, preventing render');
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Invalid data format for chart</p>
          </div>
        </div>
      );
    }
    
    switch (type) {
      case 'line':
        return (
          <LineChart data={sanitizedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={animationDuration}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={sanitizedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={animationDuration}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={sanitizedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
            <XAxis 
              dataKey={xKey} 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar 
              dataKey={yKey} 
              fill={colors[0]}
              radius={[4, 4]}
              animationDuration={animationDuration}
            />
          </BarChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={sanitizedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
            <XAxis 
              dataKey="x" 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              dataKey="y" 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              dataKey="y" 
              fill={colors[0]}
              animationDuration={animationDuration}
            />
          </ScatterChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={sanitizedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={animationDuration}
            >
              {sanitizedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <BarChart3 className="w-8 h-8 mr-2" />
            <span>Chart type not supported</span>
          </div>
        );
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line':
      case 'area':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'bar':
        return <BarChart3 className="w-5 h-5 text-green-600" />;
      case 'pie':
        return <PieChartIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center">
            {getChartIcon()}
            <h3 className="ml-2 text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 ml-7">{subtitle}</p>
          )}
        </div>
        
        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Type:</span>
          <select 
            value={type} 
            onChange={(e) => {
              // This would typically be handled by parent component
              console.log('Chart type changed:', e.target.value);
            }}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
            <option value="scatter">Scatter</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        {useFallback ? (
          <FallbackChart
            type={type}
            data={chartData}
            xKey={xKey}
            yKey={yKey}
            colors={colors}
            height={height}
          />
        ) : (
          <SafeChartWrapper>
            <ChartErrorBoundary>
              <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
              </ResponsiveContainer>
            </ChartErrorBoundary>
          </SafeChartWrapper>
        )}
      </div>

      {/* Footer */}
      {selectedDataPoint && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Selected: {JSON.stringify(selectedDataPoint)}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedChart;
