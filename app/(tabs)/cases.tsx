import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Case, AttendanceRecord } from '@/types/Case';
import { StorageService } from '@/utils/storage';
import { CaseCard } from '@/components/CaseCard';
import { AddCaseModal } from '@/components/AddCaseModal';
import { Plus, Search } from 'lucide-react-native';

export default function CasesScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);

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

  const handleAddCase = async (caseData: Omit<Case, 'id' | 'createdAt'>) => {
    try {
      const newCase: Case = {
        ...caseData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      await StorageService.addCase(newCase);
      await loadData();
    } catch (error) {
      console.error('Error adding case:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة الحالة');
    }
  };

  const handleUpdateCase = async (caseData: Omit<Case, 'id' | 'createdAt'>) => {
    if (!editingCase) return;
    
    try {
      const updatedCase: Case = {
        ...editingCase,
        ...caseData,
      };
      
      await StorageService.updateCase(updatedCase);
      await loadData();
      setEditingCase(null);
    } catch (error) {
      console.error('Error updating case:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الحالة؟ سيتم حذف جميع سجلات الحضور المرتبطة بها.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteCase(caseId);
              await loadData();
            } catch (error) {
              console.error('Error deleting case:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف الحالة');
            }
          },
        },
      ]
    );
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCase(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إدارة الحالات</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {cases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد حالات مسجلة</Text>
            <Text style={styles.emptySubtext}>اضغط على زر + لإضافة حالة جديدة</Text>
          </View>
        ) : (
          cases.map(caseItem => (
            <CaseCard
              key={caseItem.id}
              case={caseItem}
              attendance={attendance}
              onEdit={handleEditCase}
              onDelete={handleDeleteCase}
            />
          ))
        )}
      </ScrollView>

      <AddCaseModal
        visible={showAddModal}
        onClose={handleCloseModal}
        onSave={editingCase ? handleUpdateCase : handleAddCase}
        editingCase={editingCase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#10b981',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});