import React from 'react';

export default function ProgressBar({ 
  total, 
  completed, 
  percentage, 
  showLabel = true,
  size = 'medium',
  className = ''
}) {
  // Calculate percentage if not provided
  const progress = percentage !== undefined ? percentage : (total > 0 ? Math.round((completed / total) * 100) : 0);
  
  // Determine color based on progress
  const getColor = () => {
    if (progress < 30) return '#ef4444'; // red
    if (progress < 70) return '#f59e0b'; // amber
    return '#22c55e'; // green
  };

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <>
            <span className="text-sm text-gray-600">
              Tiến độ
            </span>
            <span className="text-sm font-medium" style={{ color: getColor() }}>
              {completed}/{total} ({progress}%)
            </span>
          </>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ 
            width: `${progress}%`, 
            backgroundColor: getColor() 
          }}
        />
      </div>
    </div>
  );
}
