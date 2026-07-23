import { useState } from 'react';
import { attendanceService } from '../services/attendanceService';

export function useAttendance() {
  const [loading, setLoading] = useState<boolean>(false);

  const clockIn = async (employeeId: string) => {
    setLoading(true);
    try {
      return await attendanceService.clockIn({ employeeId });
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async (employeeId: string) => {
    setLoading(true);
    try {
      return await attendanceService.clockOut({ employeeId });
    } finally {
      setLoading(false);
    }
  };

  return { clockIn, clockOut, loading };
}
