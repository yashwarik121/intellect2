import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { databaseService } from './databaseService';

export interface RegisteredUser {
  employeeId: string;
  fullName: string;
  email: string;
  password?: string;
  role?: 'EMPLOYEE' | 'ADMIN';
  createdAt?: string;
}

export const storageService = {
  // Save user credentials on registration via SQLite database
  registerUser: async (user: RegisteredUser): Promise<boolean> => {
    return databaseService.addUser(user);
  },

  // Get user details by employeeId for login validation
  getUserByEmployeeId: async (employeeId: string): Promise<RegisteredUser | null> => {
    return databaseService.getUserByEmployeeId(employeeId);
  },

  // Get all registered users list
  getAllUsers: async (): Promise<RegisteredUser[]> => {
    return databaseService.getAllUsers();
  },

  // Update user
  updateUser: async (user: RegisteredUser): Promise<boolean> => {
    return databaseService.updateUser(user);
  },

  // Delete user
  deleteUser: async (employeeId: string): Promise<boolean> => {
    return databaseService.deleteUser(employeeId);
  },

  // Store active session user
  setSessionUser: async (user: RegisteredUser): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    } catch (e) {
      console.error('Error setting session user:', e);
    }
  },

  // Get active session user
  getSessionUser: async (): Promise<RegisteredUser | null> => {
    try {
      const jsonStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!jsonStr) return null;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Error getting session user:', e);
      return null;
    }
  },

  // Clear active session (Logout)
  clearSessionUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO);
    } catch (e) {
      console.error('Error clearing session:', e);
    }
  },
};
