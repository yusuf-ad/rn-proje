import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { useBudget, BudgetEntry } from '@/context/BudgetContext';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import {
  Trash2,
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  Layout,
  SlideOutRight,
} from 'react-native-reanimated';
import { Toast } from '@/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

export default function Dashboard() {
  const {
    entries,
    deleteEntry,
    totalIncome,
    totalExpenses,
    balance,
    weeklyBudget,
    updateWeeklyBudget,
  } = useBudget();
  const [toast, setToast] = React.useState({
    visible: false,
    message: '',
    type: 'success' as const,
  });
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [newBudget, setNewBudget] = React.useState('');

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weeklySpent = entries
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entry.type === 'expense' &&
        entryDate >= weekStart &&
        entryDate <= weekEnd
      );
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const handleDelete = useCallback(
    async (entry: BudgetEntry) => {
      try {
        await deleteEntry(entry.id);
        showToast('Entry deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete entry', 'error');
      }
    },
    [deleteEntry]
  );

  const handleUpdateBudget = () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    updateWeeklyBudget(amount);
    setIsModalVisible(false);
    showToast('Weekly budget updated successfully', 'success');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.balanceContainer}>
            <Wallet size={24} color="#fff" />
            <Text style={styles.title}>Balance: ${balance.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#15803d" />
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statAmount, { color: '#15803d' }]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <TrendingDown size={20} color="#b91c1c" />
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statAmount, { color: '#b91c1c' }]}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetCard}>
          <View
            style={[
              styles.budgetHeader,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
              },
            ]}
          >
            <View>
              <PiggyBank size={24} color="#fff" />
              <Text style={styles.budgetTitle}>Weekly Budget</Text>
            </View>

            <Pressable
              onPress={() => {
                setNewBudget(weeklyBudget.toString());
                setIsModalVisible(true);
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                Edit limit
              </Text>
            </Pressable>
          </View>
          <Text style={styles.budgetAmount}>${weeklySpent.toFixed(2)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (weeklySpent / weeklyBudget) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.budgetLimit}>Limit: ${weeklyBudget}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Link href={'/signup'}>kaydoll</Link>
        <ScrollView
          style={styles.entriesList}
          showsVerticalScrollIndicator={false}
        >
          {entries.map((entry) => (
            <Animated.View
              key={entry.id}
              entering={FadeIn.duration(300)}
              exiting={SlideOutRight.duration(200)}
              layout={Layout.springify()}
              style={styles.entryCard}
            >
              <View style={styles.entryContent}>
                <View
                  style={[
                    styles.entryIcon,
                    {
                      backgroundColor:
                        entry.type === 'income' ? '#dcfce7' : '#fee2e2',
                    },
                  ]}
                >
                  {entry.type === 'income' ? (
                    <ArrowUpRight size={24} color="#15803d" />
                  ) : (
                    <ArrowDownRight size={24} color="#b91c1c" />
                  )}
                </View>
                <View style={styles.entryDetails}>
                  <Text style={styles.entryCategory}>{entry.category}</Text>
                  <Text style={styles.entryDescription}>
                    {entry.description}
                  </Text>
                </View>
                <View style={styles.entryRight}>
                  <TouchableOpacity
                    onPress={() => handleDelete(entry)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.entryAmount,
                      {
                        color: entry.type === 'income' ? '#15803d' : '#b91c1c',
                      },
                    ]}
                  >
                    {entry.type === 'income' ? '+' : '-'}$
                    {entry.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.entryDate}>
                    {format(new Date(entry.date), 'MMM dd')}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Weekly Budget</Text>
            <TextInput
              style={styles.modalInput}
              value={newBudget}
              onChangeText={setNewBudget}
              keyboardType="decimal-pad"
              placeholder="Enter new budget amount"
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateBudget}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </View>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  budgetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  budgetTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  budgetAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },
  budgetLimit: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  entriesList: {
    flex: 1,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryDetails: {
    flex: 1,
  },
  entryCategory: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: 4,
  },
  entryAmount: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  entryDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#9ca3af',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1f2937',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1f2937',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#ffffff',
  },
});
