import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Case, AttendanceRecord } from '@/types/Case';
import { StorageService } from '@/utils/storage';
import { CalculationUtils } from '@/utils/calculations';
import { DateUtils } from '@/utils/dateUtils';
import { Users, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react-native';

export default function HomeScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casesData, attendanceData] = await Promise.all([
        StorageService.getCases(),
        StorageService.getAttendanceRecords(),
      ]);
      setCases(casesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthStats = () => {
    const currentMonth = new Date();
    const today = new Date();
    const todayString = DateUtils.formatDate(today);
    
    let totalCases = cases.length;
    let todayPresent = 0;
    let todayAbsent = 0;
    let completedPayments = 0;
    let totalMonthlyIncome = 0;
    let totalPaidThisMonth = 0;

    cases.forEach(caseItem => {
      const stats = CalculationUtils.calculateMonthlyStats(caseItem, attendance, currentMonth);
      totalMonthlyIncome += stats.monthlyRequired;
      totalPaidThisMonth += stats.totalPaid;
      
      if (stats.isMonthComplete) {
        completedPayments++;
      }

      // Check today's attendance
      const todayAttendance = attendance.find(
        record => record.caseId === caseItem.id && record.date === todayString
      );
      if (todayAttendance) {
        if (todayAttendance.status === 'present') {
          todayPresent++;
        } else {
          todayAbsent++;
        }
      }
    });

    return {
      totalCases,
      todayPresent,
      todayAbsent,
      completedPayments,
      totalMonthlyIncome,
      totalPaidThisMonth,
      pendingPayments: totalCases - completedPayments,
    };
  };

  const stats = getCurrentMonthStats();
  const currentMonth = DateUtils.getMonthName(new Date());

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>لوحة التحكم</Text>
        <Text style={styles.subtitle}>شهر {currentMonth}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Users size={24} color="#ffffff" />
          <Text style={styles.statNumber}>{stats.totalCases}</Text>
          <Text style={styles.statLabel}>إجمالي الحالات</Text>
        </View>

        <View style={[styles.statCard, styles.successCard]}>
          <Calendar size={24} color="#ffffff" />
          <Text style={styles.statNumber}>{stats.todayPresent}</Text>
          <Text style={styles.statLabel}>حضور اليوم</Text>
        </View>

        <View style={[styles.statCard, styles.warningCard]}>
          <Clock size={24} color="#ffffff" />
          <Text style={styles.statNumber}>{stats.todayAbsent}</Text>
          <Text style={styles.statLabel}>غياب اليوم</Text>
        </View>

        <View style={[styles.statCard, styles.infoCard]}>
          <TrendingUp size={24} color="#ffffff" />
          <Text style={styles.statNumber}>{stats.completedPayments}</Text>
          <Text style={styles.statLabel}>مكتملة الدفع</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>ملخص الشهر المالي</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>إجمالي الإيرادات المتوقعة:</Text>
            <Text style={styles.summaryValue}>
              {CalculationUtils.formatCurrency(stats.totalMonthlyIncome)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المبلغ المحصل:</Text>
            <Text style={[styles.summaryValue, styles.successText]}>
              {CalculationUtils.formatCurrency(stats.totalPaidThisMonth)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المبلغ المتبقي:</Text>
            <Text style={[styles.summaryValue, styles.warningText]}>
              {CalculationUtils.formatCurrency(stats.totalMonthlyIncome - stats.totalPaidThisMonth)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Users size={20} color="#3b82f6" />
            <Text style={styles.actionText}>إدارة الحالات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Calendar size={20} color="#10b981" />
            <Text style={styles.actionText}>تسجيل الحضور</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <DollarSign size={20} color="#f59e0b" />
            <Text style={styles.actionText}>التقارير المالية</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryCard: {
    backgroundColor: '#3b82f6',
  },
  successCard: {
    backgroundColor: '#10b981',
  },
  warningCard: {
    backgroundColor: '#f59e0b',
  },
  infoCard: {
    backgroundColor: '#6366f1',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  successText: {
    color: '#10b981',
  },
  warningText: {
    color: '#f59e0b',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
});