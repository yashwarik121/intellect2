import { httpPostFetch, httpGetFetch } from './httpPostFetch';
import { RegisteredUser, storageService } from './storageService';

const API_BASE_URL = 'http://localhost:3001';

export const authService = {
  // POST API: Register employee via /api/register
  registerEmployee: async (user: RegisteredUser): Promise<{ success: boolean; error?: string; user?: RegisteredUser }> => {
    // 1. Sync locally
    await storageService.registerUser(user);

    // 2. Call POST /api/register
    try {
      const res = await httpPostFetch('/api/register', user);
      if (res && res.success) {
        return { success: true, user: res.user || user };
      }
      return { success: false, error: res?.error || 'Registration failed' };
    } catch (e: any) {
      console.log('[authService.registerEmployee] POST API offline, local storage used');
      return { success: true, user };
    }
  },

  // POST API: Login employee via /api/login
  loginEmployee: async (credentials: { employeeId: string; password: string }): Promise<{ success: boolean; error?: string; user?: RegisteredUser }> => {
    try {
      const res = await httpPostFetch('/api/login', credentials);
      if (res && res.success) {
        await storageService.setSessionUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res?.error || 'Login failed' };
    } catch (e: any) {
      console.log('[authService.loginEmployee] POST API fallback to local check');
      const localUser = await storageService.getUserByEmployeeId(credentials.employeeId);
      if (!localUser) {
        return { success: false, error: `No account found for Employee ID "${credentials.employeeId}". Please register first.` };
      }
      if (localUser.password !== credentials.password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      await storageService.setSessionUser(localUser);
      return { success: true, user: localUser };
    }
  },

  // GET API: Fetch all registered employees via /api/employees
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

  // DELETE API: Delete employee via /api/employees/:id
  deleteEmployee: async (employeeId: string): Promise<boolean> => {
    // 1. Delete from local storage & CSV
    await storageService.deleteUser(employeeId);

    // 2. Call DELETE /api/employees/:id API
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return data && data.success;
    } catch (e) {
      console.log('[authService.deleteEmployee] DELETE API fallback completed');
      return true;
    }
  },
};
