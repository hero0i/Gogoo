export interface Case {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  paymentType: 'daily' | 'weekly' | 'monthly';
  paymentAmount: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  caseId: string;
  date: string;
  status: 'present' | 'absent';
  createdAt: string;
}

export interface Payment {
  id: string;
  caseId: string;
  amount: number;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
}