import React from 'react';

const FallbackChart = ({ type, data, xKey, yKey, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], height = 300 }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2 opacity-50">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Sanitize data one more time
  const sanitizedData = data.map(item => {
    const sanitized = { ...item };
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        sanitized[key] = 0;
      }
    });
    return sanitized;
  });

  const maxValue = Math.max(...sanitizedData.map(item => item[yKey] || 0));
  const minValue = Math.min(...sanitizedData.map(item => item[yKey] || 0));
  const range = maxValue - minValue || 1;

  const renderBarChart = () => {
    return (
      <div className="w-full h-full flex items-end justify-around px-4">
        {sanitizedData.map((item, index) => {
          const value = item[yKey] || 0;
          const heightPercent = ((value - minValue) / range) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-20">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ 
                  height: `${Math.max(heightPercent, 5)}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              />
              <div className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                {item[xKey] || 'N/A'}
              </div>
              <div className="text-xs font-semibold text-gray-800">
                {value.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = sanitizedData.map((item, index) => {
      const value = item[yKey] || 0;
      const xPercent = (index / (sanitizedData.length - 1)) * 100;
      const yPercent = 100 - ((value - minValue) / range) * 100;
      return `${xPercent},${yPercent}`;
    }).join(' ');

    return (
      <div className="w-full h-full relative">
        <svg width="100%" height="100%" className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          {sanitizedData.map((item, index) => {
            const value = item[yKey] || 0;
            const xPercent = (index / (sanitizedData.length - 1)) * 100;
            const yPercent = 100 - ((value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${xPercent}%`}
                cy={`${yPercent}%`}
                r="4"
                fill={colors[0]}
                className="transition-all duration-300 hover:r-6"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {sanitizedData.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 text-center">
              <div className="truncate max-w-12">{item[xKey] || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = sanitizedData.reduce((sum, item) => sum + (item.value || item[yKey] || 0), 0);
    let currentAngle = 0;

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {sanitizedData.map((item, index) => {
              const value = item.value || item[yKey] || 0;
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              currentAngle = endAngle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute top-0 right-0 mt-2">
            {sanitizedData.map((item, index) => {
              const value = item.value || item[yKey] || 0;
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center mb-1">
                  <div 
                    className="w-3 h-3 mr-2"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.name || item[xKey] || 'N/A'}: {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
      case 'area':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="w-full h-full">
      {renderChart()}
    </div>
  );
};

export default FallbackChart;
