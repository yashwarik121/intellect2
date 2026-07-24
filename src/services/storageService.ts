import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export interface RegisteredUser {
  employeeId: string;
  fullName: string;
  email: string;
  password?: string;
}

export const storageService = {
  // Save user credentials on registration
  registerUser: async (user: RegisteredUser): Promise<boolean> => {
    try {
      const key = `USER_${user.employeeId.toUpperCase().trim()}`;
      await AsyncStorage.setItem(key, JSON.stringify(user));
      return true;
    } catch (e) {
      console.error('Error saving user registration:', e);
      return false;
    }
  },

  // Get user details by employeeId for login validation
  getUserByEmployeeId: async (employeeId: string): Promise<RegisteredUser | null> => {
    try {
      const key = `USER_${employeeId.toUpperCase().trim()}`;
      const jsonStr = await AsyncStorage.getItem(key);
      if (!jsonStr) return null;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Error fetching user:', e);
      return null;
    }
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
