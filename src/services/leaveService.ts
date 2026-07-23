import { httpPostFetch, httpGetFetch } from './httpPostFetch';
import { LeaveRequestPayload } from '../models/leaveModel';

export const leaveService = {
  applyLeave: async (payload: LeaveRequestPayload) => {
    return httpPostFetch('/leave/apply', payload);
  },
  getLeaveBalance: async (employeeId: string) => {
    return httpGetFetch(`/leave/balance?employeeId=${employeeId}`);
  },
  getLeaveHistory: async (employeeId: string) => {
    return httpGetFetch(`/leave/history?employeeId=${employeeId}`);
  },
};
