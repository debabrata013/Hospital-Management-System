'use client';

import { useScheduleMonitor } from '@/hooks/useScheduleMonitor';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

export const ScheduleMonitor = () => {
  const { authState } = useAuth();
  const { currentSchedule, timeRemaining, isMonitoring } = useScheduleMonitor();

  // Only show for nurses
  if (!authState.isAuthenticated || authState.user?.role !== 'nurse') {
    return null;
  }

  // Don't show if not monitoring
  if (!isMonitoring || !currentSchedule) {
    return null;
  }

  const minutesRemaining = Math.floor(timeRemaining / 1000 / 60);
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const displayMinutes = minutesRemaining % 60;

  const getTimeColor = () => {
    if (minutesRemaining <= 5) return 'text-red-600';
    if (minutesRemaining <= 15) return 'text-orange-600';
    if (minutesRemaining <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTimeDisplay = () => {
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${displayMinutes}m`;
    }
    return `${minutesRemaining}m`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Shift Status</span>
        </div>
        {minutesRemaining <= 15 && (
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Time Remaining:</span>
          <span className={`text-sm font-bold ${getTimeColor()}`}>
            {getTimeDisplay()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Shift:</span>
          <Badge variant="outline" className="text-xs">
            {currentSchedule.shiftType}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Ward:</span>
          <span className="text-xs font-medium text-gray-700">
            {currentSchedule.wardAssignment}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">End Time:</span>
          <span className="text-xs font-medium text-gray-700">
            {currentSchedule.endTime}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              minutesRemaining <= 5 ? 'bg-red-500' :
              minutesRemaining <= 15 ? 'bg-orange-500' :
              minutesRemaining <= 30 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{
              width: `${Math.max(0, Math.min(100, (timeRemaining / (8 * 60 * 60 * 1000)) * 100))}%`
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Shift Progress
        </p>
      </div>
    </div>
  );
};

export default ScheduleMonitor;
