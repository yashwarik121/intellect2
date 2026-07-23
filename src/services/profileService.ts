import { httpGetFetch, httpPostFetch } from './httpPostFetch';

export const profileService = {
  getProfile: async (employeeId: string) => {
    return httpGetFetch(`/profile?employeeId=${employeeId}`);
  },
  updateProfile: async (payload: any) => {
    return httpPostFetch('/profile/update', payload);
  },
};
