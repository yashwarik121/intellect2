export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE';
  workingHours?: number;
}
