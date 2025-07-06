import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Case } from '@/types/Case';
import { X, Save } from 'lucide-react-native';

interface AddCaseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (caseData: Omit<Case, 'id' | 'createdAt'>) => void;
  editingCase?: Case | null;
}

export function AddCaseModal({ visible, onClose, onSave, editingCase }: AddCaseModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [paymentType, setPaymentType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (editingCase) {
      setName(editingCase.name);
      setAge(editingCase.age.toString());
      setDiagnosis(editingCase.diagnosis);
      setPaymentType(editingCase.paymentType);
      setPaymentAmount(editingCase.paymentAmount.toString());
    } else {
      resetForm();
    }
  }, [editingCase, visible]);

  const resetForm = () => {
    setName('');
    setAge('');
    setDiagnosis('');
    setPaymentType('daily');
    setPaymentAmount('');
  };

  const handleSave = () => {
    if (!name.trim() || !age || !diagnosis.trim() || !paymentAmount) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const ageNum = parseInt(age);
    const amountNum = parseFloat(paymentAmount);

    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال عمر صحيح');
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('خطأ', 'يرجى إدخال مبلغ صحيح');
      return;
    }

    onSave({
      name: name.trim(),
      age: ageNum,
      diagnosis: diagnosis.trim(),
      paymentType,
      paymentAmount: amountNum,
    });

    if (!editingCase) {
      resetForm();
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editingCase ? 'تعديل الحالة' : 'إضافة حالة جديدة'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المريض *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="أدخل اسم المريض"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>العمر *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="أدخل العمر"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>التشخيص *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="أدخل التشخيص"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الدفع *</Text>
            <View style={styles.paymentTypeContainer}>
              {[
                { value: 'daily', label: 'يومي' },
                { value: 'weekly', label: 'أسبوعي' },
                { value: 'monthly', label: 'شهري' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.paymentTypeButton,
                    paymentType === type.value && styles.paymentTypeButtonActive,
                  ]}
                  onPress={() => setPaymentType(type.value as any)}
                >
                  <Text
                    style={[
                      styles.paymentTypeText,
                      paymentType === type.value && styles.paymentTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>مبلغ الدفع *</Text>
            <TextInput
              style={styles.input}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="أدخل المبلغ"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>
            {editingCase ? 'حفظ التغييرات' : 'إضافة الحالة'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  paymentTypeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  paymentTypeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  paymentTypeTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 20,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});