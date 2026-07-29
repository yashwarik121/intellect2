import { RegisteredUser } from './storageService';

export const csvService = {
  // Convert list of users into CSV string format
  usersToCSV: (users: RegisteredUser[]): string => {
    const headers = 'EmployeeID,FullName,Email,Password,Role,CreatedAt';
    const rows = users.map((u) => {
      const empId = `"${u.employeeId.replace(/"/g, '""')}"`;
      const name = `"${u.fullName.replace(/"/g, '""')}"`;
      const email = `"${u.email.replace(/"/g, '""')}"`;
      const pass = `"${(u.password || '').replace(/"/g, '""')}"`;
      const role = `"${(u.role || 'EMPLOYEE').replace(/"/g, '""')}"`;
      const created = `"${(u.createdAt || new Date().toISOString()).replace(/"/g, '""')}"`;
      return `${empId},${name},${email},${pass},${role},${created}`;
    });
    return [headers, ...rows].join('\n');
  },

  // Parse CSV string into array of RegisteredUser objects
  csvToUsers: (csvText: string): RegisteredUser[] => {
    if (!csvText) return [];
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const result: RegisteredUser[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 4) {
        result.push({
          employeeId: parts[0],
          fullName: parts[1],
          email: parts[2],
          password: parts[3],
          role: (parts[4] as any) || 'EMPLOYEE',
          createdAt: parts[5] || new Date().toISOString(),
        });
      }
    }
    return result;
  },
};
