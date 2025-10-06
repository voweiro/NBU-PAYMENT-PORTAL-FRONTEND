import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line';
  height?: number;
}

export default function SimpleChart({ data, type, height = 200 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (type === 'bar') {
    return (
      <div className="w-full" style={{ height }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const color = item.color || colors[index % colors.length];
            
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: '80%' }}>
                  <div
                    className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: color,
                      minHeight: '4px'
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                  {item.label}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full" style={{ height }}>
        <div className="relative w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={points}
              vectorEffect="non-scaling-stroke"
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (item.value / maxValue) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3B82F6"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            {data.map((item, index) => (
              <div key={index} className="text-center">
                <div>{item.label}</div>
                <div className="font-medium text-gray-900 dark:text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}