'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ScheduleInfo {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  wardAssignment: string;
  status: string;
}

export const useScheduleMonitor = () => {
  const { authState, logout } = useAuth();
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);
  const finalWarningShownRef = useRef<boolean>(false);

  // Only monitor for nurses
  const shouldMonitor = authState.isAuthenticated && authState.user?.role === 'nurse';

  const checkScheduleStatus = async () => {
    if (!shouldMonitor) return;

    try {
      console.log('[SCHEDULE-MONITOR] Checking schedule status...');
      
      const response = await fetch('/api/auth/validate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: authState.user?.id, 
          role: authState.user?.role 
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[SCHEDULE-MONITOR] Schedule validation result:', result);

        if (result.canLogin && result.schedule) {
          setCurrentSchedule(result.schedule);
          
          // Calculate time remaining in shift
          const now = new Date();
          const endTime = new Date();
          const [hours, minutes, seconds] = result.schedule.endTime.split(':');
          endTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'));
          
          const remaining = Math.max(0, endTime.getTime() - now.getTime());
          setTimeRemaining(remaining);
          
          console.log('[SCHEDULE-MONITOR] Time remaining in shift:', Math.floor(remaining / 1000 / 60), 'minutes');
          
          // Show warnings
          const minutesRemaining = Math.floor(remaining / 1000 / 60);
          
          if (minutesRemaining <= 5 && minutesRemaining > 0 && !finalWarningShownRef.current) {
            finalWarningShownRef.current = true;
            toast.warning(`Your shift ends in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`, {
              duration: 10000,
            });
          } else if (minutesRemaining <= 15 && minutesRemaining > 5 && !warningShownRef.current) {
            warningShownRef.current = true;
            toast.info(`Your shift ends in ${minutesRemaining} minutes.`, {
              duration: 5000,
            });
          }
          
          // Auto-logout if shift has ended
          if (remaining <= 0) {
            console.log('[SCHEDULE-MONITOR] Shift has ended, logging out...');
            toast.error('Your shift has ended. You will be logged out automatically.', {
              duration: 5000,
            });
            
            // Delay logout slightly to show the message
            setTimeout(() => {
              logout();
            }, 2000);
          }
        } else {
          // Schedule validation failed, logout immediately
          console.log('[SCHEDULE-MONITOR] Schedule validation failed, logging out...');
          toast.error('Schedule validation failed. You will be logged out.', {
            duration: 3000,
          });
          
          setTimeout(() => {
            logout();
          }, 1000);
        }
      } else {
        console.error('[SCHEDULE-MONITOR] Schedule validation request failed');
      }
    } catch (error) {
      console.error('[SCHEDULE-MONITOR] Error checking schedule:', error);
    }
  };

  // Start monitoring when authenticated as nurse
  useEffect(() => {
    if (!shouldMonitor) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('[SCHEDULE-MONITOR] Starting schedule monitoring for nurse:', authState.user?.name);
    
    // Initial check
    checkScheduleStatus();
    
    // Check every 30 seconds
    intervalRef.current = setInterval(checkScheduleStatus, 30000);

    // Cleanup on unmount or when monitoring stops
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldMonitor, authState.user?.id]);

  // Reset warning flags when schedule changes
  useEffect(() => {
    warningShownRef.current = false;
    finalWarningShownRef.current = false;
  }, [currentSchedule?.id]);

  return {
    currentSchedule,
    timeRemaining,
    isMonitoring: shouldMonitor && !!intervalRef.current
  };
};

export default useScheduleMonitor;
