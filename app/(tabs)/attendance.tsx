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
import { DateUtils } from '@/utils/dateUtils';
import { Calendar, CircleCheck as CheckCircle, Circle as XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function AttendanceScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const handleAttendanceToggle = async (caseId: string, status: 'present' | 'absent') => {
    try {
      const dateString = DateUtils.formatDate(selectedDate);
      const record: AttendanceRecord = {
        id: `${caseId}-${dateString}`,
        caseId,
        date: dateString,
        status,
        createdAt: new Date().toISOString(),
      };

      await StorageService.addAttendanceRecord(record);
      await loadData();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const getAttendanceStatus = (caseId: string) => {
    const dateString = DateUtils.formatDate(selectedDate);
    return attendance.find(record => record.caseId === caseId && record.date === dateString);
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = DateUtils.isSameDay(selectedDate, new Date());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تسجيل الحضور</Text>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => changeDate('prev')} style={styles.dateButton}>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {DateUtils.formatDisplayDate(DateUtils.formatDate(selectedDate))}
          </Text>
          <TouchableOpacity onPress={() => changeDate('next')} style={styles.dateButton}>
            <ChevronLeft size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>اليوم</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {cases.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>لا توجد حالات مسجلة</Text>
            <Text style={styles.emptySubtext}>أضف حالات جديدة لبدء تسجيل الحضور</Text>
          </View>
        ) : (
          cases.map(caseItem => {
            const attendanceStatus = getAttendanceStatus(caseItem.id);
            return (
              <View key={caseItem.id} style={styles.caseCard}>
                <View style={styles.caseInfo}>
                  <Text style={styles.caseName}>{caseItem.name}</Text>
                  <Text style={styles.caseDiagnosis}>{caseItem.diagnosis}</Text>
                </View>
                
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.presentButton,
                      attendanceStatus?.status === 'present' && styles.activeButton,
                    ]}
                    onPress={() => handleAttendanceToggle(caseItem.id, 'present')}
                  >
                    <CheckCircle 
                      size={20} 
                      color={attendanceStatus?.status === 'present' ? '#ffffff' : '#10b981'} 
                    />
                    <Text 
                      style={[
                        styles.buttonText,
                        attendanceStatus?.status === 'present' && styles.activeButtonText,
                      ]}
                    >
                      حاضر
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      styles.absentButton,
                      attendanceStatus?.status === 'absent' && styles.activeButton,
                    ]}
                    onPress={() => handleAttendanceToggle(caseItem.id, 'absent')}
                  >
                    <XCircle 
                      size={20} 
                      color={attendanceStatus?.status === 'absent' ? '#ffffff' : '#ef4444'} 
                    />
                    <Text 
                      style={[
                        styles.buttonText,
                        attendanceStatus?.status === 'absent' && styles.activeButtonText,
                      ]}
                    >
                      غائب
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {attendanceStatus && (
                  <View style={styles.statusIndicator}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.statusText}>
                      تم التسجيل: {attendanceStatus.status === 'present' ? 'حاضر' : 'غائب'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    marginHorizontal: 16,
    minWidth: 200,
    textAlign: 'center',
  },
  todayBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  todayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  caseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caseInfo: {
    marginBottom: 16,
  },
  caseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  caseDiagnosis: {
    fontSize: 14,
    color: '#64748b',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attendanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  presentButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  absentButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  activeButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
});