import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useBudget } from '@/context/BudgetContext';
import { format, startOfMonth, endOfMonth, subDays, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';

const screenWidth = Dimensions.get('window').width;

export default function Reports() {
  const { entries } = useBudget();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Last 7 days data for line chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, i);
      return {
        date,
        expenses: entries
          .filter(
            (entry) =>
              entry.type === 'expense' &&
              format(parseISO(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )
          .reduce((sum, entry) => sum + entry.amount, 0),
        income: entries
          .filter(
            (entry) =>
              entry.type === 'income' &&
              format(parseISO(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )
          .reduce((sum, entry) => sum + entry.amount, 0),
      };
    }).reverse();

    // Monthly category breakdown
    const monthEntries = entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    const categoryStats = monthEntries.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = {
          income: 0,
          expenses: 0,
        };
      }

      if (entry.type === 'income') {
        acc[entry.category].income += entry.amount;
      } else {
        acc[entry.category].expenses += entry.amount;
      }

      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    // Weekly totals
    const weeklyData = entries
      .filter((entry) => {
        const entryDate = parseISO(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      })
      .reduce(
        (acc, entry) => {
          if (entry.type === 'income') {
            acc.income += entry.amount;
          } else {
            acc.expenses += entry.amount;
          }
          return acc;
        },
        { income: 0, expenses: 0 }
      );

    return {
      last7Days,
      categoryStats,
      weeklyData,
      monthlyTotal: {
        income: monthEntries
          .filter((entry) => entry.type === 'income')
          .reduce((sum, entry) => sum + entry.amount, 0),
        expenses: monthEntries
          .filter((entry) => entry.type === 'expense')
          .reduce((sum, entry) => sum + entry.amount, 0),
      },
    };
  }, [entries]);

  const lineChartData = {
    labels: stats.last7Days.map((day) => format(day.date, 'dd/MM')),
    datasets: [
      {
        data: stats.last7Days.map((day) => day.expenses),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: stats.last7Days.map((day) => day.income),
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Expenses', 'Income'],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const categoryData = {
    labels: Object.keys(stats.categoryStats),
    datasets: [
      {
        data: Object.values(stats.categoryStats).map((stat) => stat.expenses),
      },
    ],
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Financial Reports</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'MMMM yyyy')}</Text>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: '#dcfce7' }]}>
            <Text style={styles.summaryLabel}>Monthly Income</Text>
            <Text style={[styles.summaryAmount, { color: '#15803d' }]}>
              ${stats.monthlyTotal.income.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#fee2e2' }]}>
            <Text style={styles.summaryLabel}>Monthly Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#b91c1c' }]}>
              ${stats.monthlyTotal.expenses.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <Text style={styles.chartTitle}>Last 7 Days Overview</Text>
            <LineChart
              data={lineChartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero
              segments={5}
            />
          </BlurView>
        </View>

        <View style={styles.chartCard}>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <Text style={styles.chartTitle}>Monthly Category Breakdown</Text>
            <BarChart
              data={categoryData}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withInnerLines={false}
              showBarTops={false}
              fromZero
            />
          </BlurView>
        </View>

        <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
        {Object.entries(stats.categoryStats).map(([category, stats]) => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.categoryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={[styles.statAmount, { color: '#15803d' }]}>
                  ${stats.income.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={[styles.statAmount, { color: '#b91c1c' }]}>
                  ${stats.expenses.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Net</Text>
                <Text
                  style={[
                    styles.statAmount,
                    { color: stats.income - stats.expenses >= 0 ? '#15803d' : '#b91c1c' },
                  ]}>
                  ${(stats.income - stats.expenses).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding to account for tab bar
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginBottom: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  chartCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blurContainer: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#0f172a',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#0f172a',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#0f172a',
    marginBottom: 12,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});