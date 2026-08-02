import { httpPostFetch, httpGetFetch } from './httpPostFetch';
import { RegisteredUser, storageService } from './storageService';

export const authService = {
  // GET API: Fetch all registered employees
  getEmployees: async (): Promise<RegisteredUser[]> => {
    try {
      const res = await httpGetFetch('/api/employees');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.log('[authService.getEmployees] Falling back to local storage');
    }
    return storageService.getAllUsers();
  },

  // POST API: Register a new employee
  registerEmployee: async (user: RegisteredUser): Promise<boolean> => {
    // 1. Save to local SQLite & CSV storage
    await storageService.registerUser(user);

    // 2. Call POST API endpoint /api/employees
    try {
      const res = await httpPostFetch('/api/employees', user);
      if (res && res.success) {
        console.log('[authService.registerEmployee] POST /api/employees success:', res.message);
        return true;
      }
    } catch (e) {
      console.log('[authService.registerEmployee] POST API call offline, local save completed');
    }
    return true;
  },
};
