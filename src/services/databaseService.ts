import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisteredUser } from './storageService';
import { csvService } from './csvService';

const DB_NAME = 'intellect_employee_portal.db';
const ASYNC_USERS_KEY = '@intellect_all_users_backup';
const ASYNC_CSV_KEY = '@intellect_all_users_csv';

let db: any = null;

const getDb = async () => {
  if (Platform.OS === 'web') {
    return null;
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
  // Sync CSV data string
  syncCSVData: async (users: RegisteredUser[]): Promise<string> => {
    const csvContent = csvService.usersToCSV(users);
    try {
      await AsyncStorage.setItem(ASYNC_CSV_KEY, csvContent);
    } catch (e) {
      console.error('[DatabaseService] CSV sync error:', e);
    }
    return csvContent;
  },

  // Get current CSV formatted string of all users
  getUsersCSVString: async (): Promise<string> => {
    const users = await databaseService.getAllUsers();
    return csvService.usersToCSV(users);
  },

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
      } else {
        await databaseService.syncCSVData(users);
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
          const list = rows as RegisteredUser[];
          await databaseService.syncCSVData(list);
          return list;
        }
      }

      const str = await AsyncStorage.getItem(ASYNC_USERS_KEY);
      const list = str ? JSON.parse(str) : [];
      await databaseService.syncCSVData(list);
      return list;
    } catch (e) {
      console.error('[DatabaseService] getAllUsers error:', e);
      const str = await AsyncStorage.getItem(ASYNC_USERS_KEY);
      const list = str ? JSON.parse(str) : [];
      await databaseService.syncCSVData(list);
      return list;
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

      const allUsers = await databaseService.getAllUsers();
      const existingIdx = allUsers.findIndex((u) => u.employeeId === newUser.employeeId);
      if (existingIdx >= 0) {
        allUsers[existingIdx] = newUser;
      } else {
        allUsers.unshift(newUser);
      }
      await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(allUsers));
      await databaseService.syncCSVData(allUsers);
      return true;
    } catch (e) {
      console.error('[DatabaseService] addUser error:', e);
      return false;
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

      const allUsers = await databaseService.getAllUsers();
      const idx = allUsers.findIndex((u) => u.employeeId.toUpperCase() === cleanId);
      if (idx >= 0) {
        allUsers[idx] = { ...allUsers[idx], ...user, employeeId: cleanId };
        await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(allUsers));
        await databaseService.syncCSVData(allUsers);
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

      const allUsers = await databaseService.getAllUsers();
      const filtered = allUsers.filter((u) => u.employeeId.toUpperCase() !== cleanId);
      await AsyncStorage.setItem(ASYNC_USERS_KEY, JSON.stringify(filtered));
      await databaseService.syncCSVData(filtered);
      return true;
    } catch (e) {
      console.error('[DatabaseService] deleteUser error:', e);
      return false;
    }
  },
};
