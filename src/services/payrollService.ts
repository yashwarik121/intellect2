import { httpGetFetch } from './httpPostFetch';

export const payrollService = {
  getPaystubs: async (employeeId: string) => {
    return httpGetFetch(`/payroll/paystubs?employeeId=${employeeId}`);
  },
  getPaystubDetail: async (paystubId: string) => {
    return httpGetFetch(`/payroll/paystub/${paystubId}`);
  },
};
