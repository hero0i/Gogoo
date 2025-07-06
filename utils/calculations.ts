import { Case, AttendanceRecord } from '@/types/Case';
import { DateUtils } from './dateUtils';

export const CalculationUtils = {
  calculateMonthlyPayment(paymentCase: Case): number {
    switch (paymentCase.paymentType) {
      case 'daily':
        return paymentCase.paymentAmount * 30; // Assume 30 days per month
      case 'weekly':
        return paymentCase.paymentAmount * 4; // Assume 4 weeks per month
      case 'monthly':
        return paymentCase.paymentAmount;
      default:
        return 0;
    }
  },

  calculateDailyPayment(paymentCase: Case): number {
    switch (paymentCase.paymentType) {
      case 'daily':
        return paymentCase.paymentAmount;
      case 'weekly':
        return paymentCase.paymentAmount / 7;
      case 'monthly':
        return paymentCase.paymentAmount / 30;
      default:
        return 0;
    }
  },

  getAttendanceForMonth(attendance: AttendanceRecord[], caseId: string, month: Date): AttendanceRecord[] {
    const monthStart = DateUtils.getMonthStart(month);
    const monthEnd = DateUtils.getMonthEnd(month);
    
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      return record.caseId === caseId && 
             recordDate >= monthStart && 
             recordDate <= monthEnd;
    });
  },

  calculateMonthlyStats(paymentCase: Case, attendance: AttendanceRecord[], month: Date) {
    const monthlyAttendance = this.getAttendanceForMonth(attendance, paymentCase.id, month);
    const presentDays = monthlyAttendance.filter(r => r.status === 'present').length;
    const absentDays = monthlyAttendance.filter(r => r.status === 'absent').length;
    const totalDays = DateUtils.getDaysInMonth(month);
    const remainingDays = totalDays - presentDays - absentDays;
    
    const dailyPayment = this.calculateDailyPayment(paymentCase);
    const totalPaid = presentDays * dailyPayment;
    const monthlyRequired = this.calculateMonthlyPayment(paymentCase);
    const remainingPayment = Math.max(0, monthlyRequired - totalPaid);
    
    return {
      presentDays,
      absentDays,
      remainingDays,
      totalPaid,
      monthlyRequired,
      remainingPayment,
      isMonthComplete: remainingPayment === 0,
    };
  },

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} ج.م`;
  },
};