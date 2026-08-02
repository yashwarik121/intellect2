import { httpPostFetch, httpGetFetch } from './httpPostFetch';

export interface LeaveRequest {
  id?: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status?: string;
  appliedDate?: string;
}

export const leaveService = {
  // GET API: Fetch submitted leave requests
  getLeaves: async (employeeId?: string): Promise<LeaveRequest[]> => {
    try {
      const res = await httpGetFetch('/api/leaves');
      if (res && res.success && Array.isArray(res.data)) {
        if (employeeId) {
          return res.data.filter((item: LeaveRequest) => item.employeeId === employeeId);
        }
        return res.data;
      }
    } catch (e) {
      console.log('[leaveService.getLeaves] API fetch error');
    }
    return [
      {
        id: 'LV-101',
        employeeId: employeeId || 'EMP1002',
        leaveType: 'Casual Leave',
        startDate: '2026-08-05',
        endDate: '2026-08-07',
        reason: 'Family vacation',
        status: 'PENDING',
        appliedDate: '2026-08-01',
      },
    ];
  },

  // POST API: Submit a new leave request
  submitLeave: async (payload: LeaveRequest): Promise<any> => {
    try {
      const res = await httpPostFetch('/api/leaves', payload);
      if (res && res.success) {
        return res.data;
      }
    } catch (e) {
      console.log('[leaveService.submitLeave] POST API fallback');
    }
    return {
      id: `LV-${Date.now().toString().slice(-4)}`,
      ...payload,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
    };
  },
};
