import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useBudget, categories } from '@/context/BudgetContext';
import { Toast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import {
  DollarSign,
  Tag,
  FileText,
  CircleArrowUp as ArrowUpCircle,
  CircleArrowDown as ArrowDownCircle,
  Calendar,
  CircleCheck as CheckCircle2,
  Circle as XCircle,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AddEntry() {
  const { addEntry } = useBudget();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const progress = Math.min(
    (amount ? 30 : 0) + (description ? 35 : 0) + (category ? 35 : 0),
    100
  );

  const handleAmountChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleanedText);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    try {
      await addEntry({
        amount: Number(parseFloat(amount).toFixed(2)),
        description: description.trim(),
        category,
        type,
        date: new Date().toISOString(),
      });

      showToast(
        `${type === 'income' ? 'Income' : 'Expense'} added successfully!`,
        'success'
      );

      setAmount('');
      setDescription('');
      setCategory('');
    } catch (error) {
      showToast('Failed to add entry', 'error');
    }
  };

  const getButtonText = () => {
    if (!amount || !description || !category) {
      return type === 'income' ? 'Add Income' : 'Add Expense';
    }
    return `Add ${type === 'income' ? 'Income' : 'Expense'}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Add Transaction</Text>
          <AnimatedCircularProgress
            size={80}
            width={8}
            fill={progress}
            tintColor="#ffffff"
            backgroundColor="rgba(255, 255, 255, 0.2)"
            rotation={0}
          >
            {(fill) => (
              <Text style={styles.progressText}>{Math.round(fill)}%</Text>
            )}
          </AnimatedCircularProgress>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Animated.View entering={FadeInUp.delay(200)} style={styles.content}>
          <View style={styles.card}>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.typeButtonActive,
                ]}
                onPress={() => setType('expense')}
              >
                <ArrowDownCircle
                  size={24}
                  color={type === 'expense' ? '#b91c1c' : '#64748b'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'expense' && styles.typeButtonTextActive,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && styles.typeButtonActive,
                ]}
                onPress={() => setType('income')}
              >
                <ArrowUpCircle
                  size={24}
                  color={type === 'income' ? '#15803d' : '#64748b'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'income' && styles.typeButtonTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <FileText size={20} color="#64748b" />
              </View>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                maxLength={100}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <DollarSign size={20} color="#64748b" />
              </View>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                maxLength={10}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Tag size={20} color="#64748b" />
                <Text style={styles.categoryTitle}>Category</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Clock size={20} color="#64748b" />
                <Text style={styles.infoText}>
                  {format(new Date(), 'MMMM dd, yyyy HH:mm')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!amount || !description || !category) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!amount || !description || !category}
            >
              {amount && description && category ? (
                <CheckCircle2 size={24} color="#ffffff" />
              ) : (
                <XCircle size={24} color="#ffffff" />
              )}
              <Text style={styles.submitButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding to account for tab bar
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 4,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#0f172a',
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#0f172a',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#7c3aed',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  infoSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
