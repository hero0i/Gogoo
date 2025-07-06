import AsyncStorage from '@react-native-async-storage/async-storage';
import { Case, AttendanceRecord, Payment } from '@/types/Case';

const CASES_KEY = 'attendance_cases';
const ATTENDANCE_KEY = 'attendance_records';
const PAYMENTS_KEY = 'payment_records';

export const StorageService = {
  // Cases
  async getCases(): Promise<Case[]> {
    try {
      const data = await AsyncStorage.getItem(CASES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cases:', error);
      return [];
    }
  },

  async saveCases(cases: Case[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CASES_KEY, JSON.stringify(cases));
    } catch (error) {
      console.error('Error saving cases:', error);
    }
  },

  async addCase(newCase: Case): Promise<void> {
    const cases = await this.getCases();
    cases.push(newCase);
    await this.saveCases(cases);
  },

  async updateCase(updatedCase: Case): Promise<void> {
    const cases = await this.getCases();
    const index = cases.findIndex(c => c.id === updatedCase.id);
    if (index !== -1) {
      cases[index] = updatedCase;
      await this.saveCases(cases);
    }
  },

  async deleteCase(caseId: string): Promise<void> {
    const cases = await this.getCases();
    const filteredCases = cases.filter(c => c.id !== caseId);
    await this.saveCases(filteredCases);
    
    // Also delete related attendance records
    const attendanceRecords = await this.getAttendanceRecords();
    const filteredAttendance = attendanceRecords.filter(r => r.caseId !== caseId);
    await this.saveAttendanceRecords(filteredAttendance);
    
    // Also delete related payments
    const payments = await this.getPayments();
    const filteredPayments = payments.filter(p => p.caseId !== caseId);
    await this.savePayments(filteredPayments);
  },

  // Attendance Records
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const data = await AsyncStorage.getItem(ATTENDANCE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting attendance records:', error);
      return [];
    }
  },

  async saveAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving attendance records:', error);
    }
  },

  async addAttendanceRecord(record: AttendanceRecord): Promise<void> {
    const records = await this.getAttendanceRecords();
    const existingIndex = records.findIndex(r => r.caseId === record.caseId && r.date === record.date);
    
    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    await this.saveAttendanceRecords(records);
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    try {
      const data = await AsyncStorage.getItem(PAYMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting payments:', error);
      return [];
    }
  },

  async savePayments(payments: Payment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  },

  async addPayment(payment: Payment): Promise<void> {
    const payments = await this.getPayments();
    payments.push(payment);
    await this.savePayments(payments);
  },
};