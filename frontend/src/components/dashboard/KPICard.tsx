import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, icon: Icon, color = 'blue', description }) => {
  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-600';
    if (changeType === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'increase') return <TrendingUp className="w-4 h-4" />;
    if (changeType === 'decrease') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getColorClasses = () => {
    const colorMap = {
      blue: 'bg-blue-500 border-blue-200',
      green: 'bg-green-500 border-green-200',
      purple: 'bg-purple-500 border-purple-200',
      orange: 'bg-orange-500 border-orange-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses()}`}>
          <icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {change && (
        <div className={`flex items-center mt-4 ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="ml-1 text-sm font-medium">{change}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
