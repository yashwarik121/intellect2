import { httpPostFetch, httpGetFetch } from './httpPostFetch';

export const attendanceService = {
  clockIn: async (payload: { employeeId: string; location?: string }) => {
    return httpPostFetch('/attendance/clock-in', payload);
  },
  clockOut: async (payload: { employeeId: string; location?: string }) => {
    return httpPostFetch('/attendance/clock-out', payload);
  },
  getAttendanceHistory: async (employeeId: string) => {
    return httpGetFetch(`/attendance/history?employeeId=${employeeId}`);
  },
};
