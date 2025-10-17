import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}

export default function ChartCard({ title, children, description, action }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      <div className="h-80">
        {children}
      </div>
    </div>
  );
}