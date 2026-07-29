import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisteredUser } from './storageService';

const DB_NAME = 'intellect_employee_portal.db';
const ASYNC_USERS_KEY = '@intellect_all_users_backup';

let db: any = null;

// Dynamically import SQLite only on Native Android / iOS platforms to prevent Web .wasm bundler errors
const getDb = async () => {
  if (Platform.OS === 'web') {
    return null; // On web, use AsyncStorage seamlessly
  }
  if (!db) {
    try {
      const SQLite = require('expo-sqlite');
      if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
        db = await SQLite.openDatabaseAsync(DB_NAME);
      }
    } catch (e) {
      console.log('[DatabaseService] Native SQLite fallback to AsyncStorage:', e);
    }
  }
  return db;
};

export const databaseService = {
  // Initialize Database Table & Default Admin Seed
  initDatabase: async (): Promise<void> => {
    try {
      const database = await getDb();
      if (database) {
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            employeeId TEXT PRIMARY KEY NOT NULL,
            fullName TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'EMPLOYEE',
            createdAt TEXT
          );
        `);
      }

      // Check if users exist; if empty, seed default admin & sample users
      const users = await databaseService.getAllUsers();
      if (users.length === 0) {
        const seedUsers: RegisteredUser[] = [
          {
            employeeId: 'EMP1001',
            fullName: 'Admin User',
            email: 'admin@intellect.com',
            password: 'adminpassword',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
          },
          {
            employeeId: 'EMP1002',
            fullName: 'Rahul Sharma',
            email: 'rahul.sharma@intellect.com',
            password: 'password123',
            role: 'EMPLOYEE',
            createdAt: new Date().toISOString(),
          },
        ];

        for (const u of seedUsers) {
          await databaseService.addUser(u);
        }
      }
    } catch (e) {
      console.error('[DatabaseService] initDatabase error:', e);
    }
  },

  // GET All Registered Users
  getAllUsers: async (): Promise<RegisteredUser[]> => {
    try {
      const database = await getDb();
      if (database) {
        const rows = await database.getAllAsync('SELECT * FROM users ORDER BY createdAt DESC;');
        if (rows && rows.length > 0) {
          return rows as RegisteredUser[];
        }
      }

      // Fallback / Web: AsyncStorage
      const str = await AsyncStorage.getItem(ASYNC_USERS_KEY);
      return str ? JSON.parse(str) : [];
    } catch (e) {
      console.error('[DatabaseService] getAllUsers error:', e);
      const str = await AsyncStorage.getItem(ASYNC_USERS_KEY);
      return str ? JSON.parse(str) : [];
    }
  },

  // GET User by Employee ID
  getUserByEmployeeId: async (empId: string): Promise<RegisteredUser | null> => {
    const cleanId = empId.trim().toUpperCase();
    try {
      const database = await getDb();
      if (database) {
        const row = await database.getFirstAsync('SELECT * FROM users WHERE UPPER(employeeId) = ?;', [cleanId]);
        if (row) return row as RegisteredUser;
      }

      const all = await databaseService.getAllUsers();
      return all.find((u) => u.employeeId.toUpperCase() === cleanId) || null;
    } catch (e) {
      console.error('[DatabaseService] getUserByEmployeeId error:', e);
      const all = await databaseService.getAllUsers();
      return all.find((u) => u.employeeId.toUpperCase() === cleanId) || null;
    }
  },

  // CREATE / ADD User
  addUser: async (user: RegisteredUser): Promise<boolean> => {
    const newUser: RegisteredUser = {
      ...user,
      employeeId: user.employeeId.trim().toUpperCase(),
      role: user.role || 'EMPLOYEE',
      createdAt: user.createdAt || new Date().toISOString(),
    };

    try {
      const database = await getDb();
      if (database) {
        await database.runAsync(
          'INSERT OR REPLACE INTO users (employeeId, fullName, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
          [newUser.employeeId, newUser.fullName, newUser.email, newUser.password, newUser.role || 'EMPLOYEE', newUser.createdAt]
        );
      }

      // Sync with AsyncStorage
      const allUsers = await databaseService.getAllUsers();
      const existingIdx = allUsers.findIndex((u) => u.employeeId === newUser.employeeId);
      if (existingIdx >= 0) {
        allUsers[existingIdx] = newUser;
      } else {
        allUsers.unshift(newUser);
      }
      await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(allUsers));
      return true;
    } catch (e) {
      console.error('[DatabaseService] addUser error:', e);
      // Ensure AsyncStorage fallback works even if DB throws
      try {
        const str = await AsyncStorage.getItem(ASYNC_USERS_KEY);
        const allUsers: RegisteredUser[] = str ? JSON.parse(str) : [];
        const existingIdx = allUsers.findIndex((u) => u.employeeId === newUser.employeeId);
        if (existingIdx >= 0) {
          allUsers[existingIdx] = newUser;
        } else {
          allUsers.unshift(newUser);
        }
        await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(allUsers));
        return true;
      } catch (err) {
        return false;
      }
    }
  },

  // UPDATE User
  updateUser: async (user: RegisteredUser): Promise<boolean> => {
    const cleanId = user.employeeId.trim().toUpperCase();
    try {
      const database = await getDb();
      if (database) {
        await database.runAsync(
          'UPDATE users SET fullName = ?, email = ?, password = ?, role = ? WHERE UPPER(employeeId) = ?;',
          [user.fullName, user.email, user.password, user.role || 'EMPLOYEE', cleanId]
        );
      }

      // Sync with AsyncStorage
      const allUsers = await databaseService.getAllUsers();
      const idx = allUsers.findIndex((u) => u.employeeId.toUpperCase() === cleanId);
      if (idx >= 0) {
        allUsers[idx] = { ...allUsers[idx], ...user, employeeId: cleanId };
        await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(allUsers));
      }
      return true;
    } catch (e) {
      console.error('[DatabaseService] updateUser error:', e);
      return false;
    }
  },

  // DELETE User
  deleteUser: async (empId: string): Promise<boolean> => {
    const cleanId = empId.trim().toUpperCase();
    try {
      const database = await getDb();
      if (database) {
        await database.runAsync('DELETE FROM users WHERE UPPER(employeeId) = ?;', [cleanId]);
      }

      // Sync with AsyncStorage
      const allUsers = await databaseService.getAllUsers();
      const filtered = allUsers.filter((u) => u.employeeId.toUpperCase() !== cleanId);
      await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('[DatabaseService] deleteUser error:', e);
      return false;
    }
  },
};
