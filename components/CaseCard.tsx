import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Case, AttendanceRecord } from '@/types/Case';
import { CalculationUtils } from '@/utils/calculations';
import { DateUtils } from '@/utils/dateUtils';
import { User, Calendar, DollarSign, CreditCard as Edit, Trash2 } from 'lucide-react-native';

interface CaseCardProps {
  case: Case;
  attendance: AttendanceRecord[];
  onEdit: (caseItem: Case) => void;
  onDelete: (caseId: string) => void;
}

export function CaseCard({ case: caseItem, attendance, onEdit, onDelete }: CaseCardProps) {
  const currentMonth = new Date();
  const stats = CalculationUtils.calculateMonthlyStats(caseItem, attendance, currentMonth);

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      default: return type;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.patientInfo}>
          <User size={20} color="#1e293b" />
          <Text style={styles.name}>{caseItem.name}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(caseItem)} style={styles.actionButton}>
            <Edit size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(caseItem.id)} style={styles.actionButton}>
            <Trash2 size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.diagnosis}>{caseItem.diagnosis}</Text>
      <Text style={styles.age}>العمر: {caseItem.age} سنة</Text>
      
      <View style={styles.paymentInfo}>
        <DollarSign size={16} color="#059669" />
        <Text style={styles.paymentText}>
          {CalculationUtils.formatCurrency(caseItem.paymentAmount)} ({getPaymentTypeText(caseItem.paymentType)})
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Calendar size={16} color="#3b82f6" />
          <Text style={styles.statText}>الحضور: {stats.presentDays}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>الغياب: {stats.absentDays}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>المتبقي: {stats.remainingDays}</Text>
        </View>
      </View>
      
      <View style={styles.paymentStats}>
        <Text style={styles.paidAmount}>المدفوع: {CalculationUtils.formatCurrency(stats.totalPaid)}</Text>
        <Text style={styles.remainingAmount}>المتبقي: {CalculationUtils.formatCurrency(stats.remainingPayment)}</Text>
      </View>
      
      {stats.isMonthComplete && (
        <View style={styles.completeBadge}>
          <Text style={styles.completeText}>مكتمل الدفع</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  diagnosis: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  age: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 4,
  },
  paymentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  paidAmount: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  completeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
});