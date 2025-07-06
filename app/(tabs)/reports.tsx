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
import { ChartBar as BarChart3, Calendar, DollarSign, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function ReportsScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newMonth);
  };

  const getMonthlyReport = () => {
    let completedCases: any[] = [];
    let pendingCases: any[] = [];
    let totalIncome = 0;
    let totalPaid = 0;

    cases.forEach(caseItem => {
      const stats = CalculationUtils.calculateMonthlyStats(caseItem, attendance, selectedMonth);
      totalIncome += stats.monthlyRequired;
      totalPaid += stats.totalPaid;

      const caseReport = {
        case: caseItem,
        stats,
      };

      if (stats.isMonthComplete) {
        completedCases.push(caseReport);
      } else {
        pendingCases.push(caseReport);
      }
    });

    return {
      completedCases,
      pendingCases,
      totalIncome,
      totalPaid,
      remainingAmount: totalIncome - totalPaid,
    };
  };

  const report = getMonthlyReport();
  const monthName = DateUtils.getMonthName(selectedMonth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>التقارير المالية</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
            <ChevronLeft size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {/* Monthly Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>ملخص الشهر</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <DollarSign size={24} color="#10b981" />
              <Text style={styles.summaryValue}>
                {CalculationUtils.formatCurrency(report.totalPaid)}
              </Text>
              <Text style={styles.summaryLabel}>المحصل</Text>
            </View>
            <View style={styles.summaryItem}>
              <TrendingUp size={24} color="#f59e0b" />
              <Text style={styles.summaryValue}>
                {CalculationUtils.formatCurrency(report.remainingAmount)}
              </Text>
              <Text style={styles.summaryLabel}>المتبقي</Text>
            </View>
            <View style={styles.summaryItem}>
              <BarChart3 size={24} color="#3b82f6" />
              <Text style={styles.summaryValue}>
                {CalculationUtils.formatCurrency(report.totalIncome)}
              </Text>
              <Text style={styles.summaryLabel}>الإجمالي</Text>
            </View>
          </View>
        </View>

        {/* Completed Cases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الحالات مكتملة الدفع ({report.completedCases.length})</Text>
          {report.completedCases.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد حالات مكتملة الدفع</Text>
          ) : (
            report.completedCases.map(({ case: caseItem, stats }) => (
              <View key={caseItem.id} style={styles.caseReportCard}>
                <View style={styles.caseHeader}>
                  <Text style={styles.caseName}>{caseItem.name}</Text>
                  <View style={styles.completeBadge}>
                    <Text style={styles.completeText}>مكتمل</Text>
                  </View>
                </View>
                <View style={styles.caseStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>أيام الحضور:</Text>
                    <Text style={styles.statValue}>{stats.presentDays}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>المبلغ المدفوع:</Text>
                    <Text style={styles.statValue}>
                      {CalculationUtils.formatCurrency(stats.totalPaid)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Pending Cases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الحالات المعلقة ({report.pendingCases.length})</Text>
          {report.pendingCases.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد حالات معلقة</Text>
          ) : (
            report.pendingCases.map(({ case: caseItem, stats }) => (
              <View key={caseItem.id} style={styles.caseReportCard}>
                <View style={styles.caseHeader}>
                  <Text style={styles.caseName}>{caseItem.name}</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>معلق</Text>
                  </View>
                </View>
                <View style={styles.caseStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>أيام الحضور:</Text>
                    <Text style={styles.statValue}>{stats.presentDays}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>المبلغ المدفوع:</Text>
                    <Text style={styles.statValue}>
                      {CalculationUtils.formatCurrency(stats.totalPaid)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>المتبقي:</Text>
                    <Text style={[styles.statValue, styles.remainingValue]}>
                      {CalculationUtils.formatCurrency(stats.remainingPayment)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    color: '#ffffff',
    marginHorizontal: 16,
    minWidth: 150,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
  caseReportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  completeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
  },
  caseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  remainingValue: {
    color: '#dc2626',
  },
});