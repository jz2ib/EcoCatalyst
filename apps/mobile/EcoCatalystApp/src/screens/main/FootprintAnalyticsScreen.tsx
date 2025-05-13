import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFootprint, FootprintCategory } from '../../contexts/footprint/FootprintContext';
import CarbonAnalyticsCard from '../../components/footprint/CarbonAnalyticsCard';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FootprintAnalyticsScreen: React.FC = () => {
  const { entries, summary, isLoading, getFootprintByCategory } = useFootprint();
  const navigation = useNavigation();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [categoryData, setCategoryData] = useState<any>({});
  const [trendData, setTrendData] = useState<any>({});
  
  useEffect(() => {
    if (entries.length === 0) return;
    
    const categories: FootprintCategory[] = ['transportation', 'food', 'housing', 'products', 'services', 'other'];
    const categoryValues = categories.map(cat => summary.byCategory[cat]);
    
    setCategoryData({
      labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1, 3)),
      datasets: [
        {
          data: categoryValues,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2
        }
      ]
    });
    
    generateTrendData(selectedPeriod);
  }, [entries, summary, selectedPeriod]);
  
  const generateTrendData = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (entries.length === 0) return;
    
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];
    
    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.getDate().toString());
        
        const dayEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getDate() === date.getDate() && 
                 entryDate.getMonth() === date.getMonth() && 
                 entryDate.getFullYear() === date.getFullYear();
        });
        
        const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
        data.push(dayTotal);
      }
    } else if (period === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (i * 7 + 6));
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - (i * 7));
        
        labels.push(`W${4-i}`);
        
        const weekEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
        
        const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
        data.push(weekTotal);
      }
    } else if (period === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const monthIndex = date.getMonth();
        labels.push(monthNames[monthIndex]);
        
        const monthEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === monthIndex && 
                 entryDate.getFullYear() === date.getFullYear();
        });
        
        const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
        data.push(monthTotal);
      }
    } else if (period === 'yearly') {
      for (let i = 2; i >= 0; i--) {
        const year = now.getFullYear() - i;
        labels.push(year.toString());
        
        const yearEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year;
        });
        
        const yearTotal = yearEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
        data.push(yearTotal);
      }
    }
    
    setTrendData({
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          strokeWidth: 2
        }
      ]
    });
  };
  
  const formatCarbonValue = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}t`;
    }
    return `${numValue.toFixed(1)}kg`;
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading carbon footprint data...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Carbon Footprint Analytics</Text>
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.daily.toFixed(1)}</Text>
          <Text style={styles.summaryLabel}>kg CO₂e Today</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.monthly.toFixed(1)}</Text>
          <Text style={styles.summaryLabel}>kg CO₂e This Month</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.totalSaved.toFixed(1)}</Text>
          <Text style={styles.summaryLabel}>kg CO₂e Saved</Text>
        </View>
      </View>
      
      {entries.length > 0 ? (
        <>
          <CarbonAnalyticsCard
            title="Carbon Footprint Trend"
            data={trendData}
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            formatYLabel={formatCarbonValue}
          />
          
          <CarbonAnalyticsCard
            title="Carbon Footprint by Category"
            data={categoryData}
            period={selectedPeriod}
            formatYLabel={formatCarbonValue}
          />
          
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Carbon Insights</Text>
            
            <View style={styles.insightCard}>
              <MaterialIcons name="trending-up" size={24} color="#F44336" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Highest Impact Category</Text>
                <Text style={styles.insightValue}>
                  {Object.entries(summary.byCategory)
                    .sort(([, a], [, b]) => b - a)[0][0]}
                </Text>
              </View>
            </View>
            
            <View style={styles.insightCard}>
              <MaterialIcons name="trending-down" size={24} color="#4CAF50" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Lowest Impact Category</Text>
                <Text style={styles.insightValue}>
                  {Object.entries(summary.byCategory)
                    .sort(([, a], [, b]) => a - b)[0][0]}
                </Text>
              </View>
            </View>
            
            <View style={styles.insightCard}>
              <MaterialIcons name="speed" size={24} color="#2196F3" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Daily Average</Text>
                <Text style={styles.insightValue}>{summary.averagePerDay.toFixed(1)} kg CO₂e</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="eco" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No carbon footprint data yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start tracking your activities to see analytics
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  insightsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  insightContent: {
    marginLeft: 16,
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: '#757575',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FootprintAnalyticsScreen;
