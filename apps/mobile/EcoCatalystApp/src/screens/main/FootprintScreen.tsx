import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFootprint, FootprintCategory } from '../../contexts/footprint/FootprintContext';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';

const screenWidth = Dimensions.get('window').width;

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + ' tons';
  }
  return num.toFixed(1) + ' kg';
};

const getCategoryColor = (category: FootprintCategory): string => {
  switch (category) {
    case 'food':
      return '#4CAF50'; // Green
    case 'transportation':
      return '#FF9800'; // Orange
    case 'housing':
      return '#2196F3'; // Blue
    case 'products':
      return '#9C27B0'; // Purple
    case 'services':
      return '#F44336'; // Red
    default:
      return '#757575'; // Grey
  }
};

const FootprintScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { 
    entries, 
    summary, 
    isLoading, 
    error, 
    addFootprintEntry,
    calculateSummary,
    getFootprintByDateRange,
    getFootprintByCategory
  } = useFootprint();
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    category: 'food' as FootprintCategory,
    activityType: '',
    carbonAmount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
  });
  
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  
  useEffect(() => {
    prepareChartData();
    preparePieChartData();
  }, [entries, timeFrame]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      calculateSummary();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [calculateSummary]);
  
  const prepareChartData = async () => {
    try {
      const now = new Date();
      let labels: string[] = [];
      let data: number[] = [];
      
      if (timeFrame === 'daily') {
        labels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.getDate().toString();
        });
        
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
          const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
          
          const dayEntries = await getFootprintByDateRange(startDate, endDate);
          const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
          data.push(dayTotal);
        }
      } else if (timeFrame === 'weekly') {
        labels = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - ((5 - i) * 7));
          return `W${Math.ceil(date.getDate() / 7)}`;
        });
        
        for (let i = 0; i < 6; i++) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - (i * 7));
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          
          const weekEntries = await getFootprintByDateRange(startDate.toISOString(), endDate.toISOString());
          const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
          data.unshift(weekTotal);
        }
      } else if (timeFrame === 'monthly') {
        labels = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return date.toLocaleString('default', { month: 'short' });
        });
        
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
          const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
          
          const monthEntries = await getFootprintByDateRange(startDate, endDate);
          const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
          data.push(monthTotal);
        }
      } else {
        const currentYear = now.getFullYear();
        labels = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
        
        for (let i = 0; i < 5; i++) {
          const year = currentYear - 4 + i;
          const startDate = new Date(year, 0, 1).toISOString();
          const endDate = new Date(year, 11, 31).toISOString();
          
          const yearEntries = await getFootprintByDateRange(startDate, endDate);
          const yearTotal = yearEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
          data.push(yearTotal);
        }
      }
      
      setChartData({
        labels,
        datasets: [{ data }]
      });
    } catch (error) {
      console.error('Error preparing chart data:', error);
    }
  };
  
  const preparePieChartData = () => {
    const categories: FootprintCategory[] = ['food', 'transportation', 'housing', 'products', 'services', 'other'];
    const data = categories.map(category => {
      const categoryEntries = getFootprintByCategory(category);
      const total = categoryEntries.reduce((sum, entry) => sum + entry.carbonAmount, 0);
      
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: total,
        color: getCategoryColor(category),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    }).filter(item => item.value > 0);
    
    setPieChartData(data.length > 0 ? data : [
      {
        name: 'No Data',
        value: 1,
        color: '#CCCCCC',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }
    ]);
  };
  
  const handleAddEntry = async () => {
    if (!newEntry.activityType || !newEntry.carbonAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    try {
      await addFootprintEntry({
        category: newEntry.category,
        activityType: newEntry.activityType,
        carbonAmount: parseFloat(newEntry.carbonAmount),
        description: newEntry.description,
        date: newEntry.date
      });
      
      setShowAddModal(false);
      setNewEntry({
        category: 'food',
        activityType: '',
        carbonAmount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      calculateSummary();
    } catch (error) {
      console.error('Error adding entry:', error);
      Alert.alert('Error', 'Failed to add entry. Please try again.');
    }
  };
  
  const renderCategoryCards = () => {
    const categories: FootprintCategory[] = ['food', 'transportation', 'housing', 'products', 'services'];
    
    return categories.map((category) => {
      const amount = summary.byCategory[category];
      const total = Object.values(summary.byCategory).reduce((sum, val) => sum + val, 0);
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      
      return (
        <View key={category} style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <Text style={styles.categoryValue}>{formatNumber(amount)}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${percentage}%`, 
                  backgroundColor: getCategoryColor(category) 
                }
              ]} 
            />
          </View>
        </View>
      );
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carbon Footprint</Text>
        <Text style={styles.subtitle}>Track your environmental impact</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('FootprintAnalytics')}
          >
            <MaterialIcons name="analytics" size={20} color="white" />
            <Text style={styles.headerButtonText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('GoalSetting')}
          >
            <MaterialIcons name="flag" size={20} color="white" />
            <Text style={styles.headerButtonText}>Goals</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your carbon footprint data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Carbon Footprint</Text>
            <Text style={styles.summaryValue}>{formatNumber(summary[timeFrame])}</Text>
            <Text style={styles.summaryDescription}>
              {summary.averagePerDay > 0 
                ? `${Math.abs(Math.round((summary.averagePerDay / 10) - 1) * 100)}% ${summary.averagePerDay < 10 ? 'below' : 'above'} average`
                : 'Start tracking to see comparison'}
            </Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '65%' }]} />
            </View>
            <Text style={styles.progressText}>Goal: {formatNumber(summary[timeFrame] * 0.8)}</Text>
          </View>
          
          <View style={styles.timeFrameContainer}>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'daily' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('daily')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'daily' && styles.activeTimeFrameText]}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'weekly' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('weekly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'weekly' && styles.activeTimeFrameText]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'monthly' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('monthly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'monthly' && styles.activeTimeFrameText]}>Monthly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'yearly' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('yearly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'yearly' && styles.activeTimeFrameText]}>Yearly</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Carbon Footprint Trend</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#4CAF50'
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            
            <View style={styles.pieChartContainer}>
              <PieChart
                data={pieChartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            
            {renderCategoryCards()}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips to Reduce</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Eat more plant-based meals</Text>
              <Text style={styles.tipDescription}>Reducing meat consumption by 50% can lower your food carbon footprint by up to 40%.</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Use public transportation</Text>
              <Text style={styles.tipDescription}>Taking the bus instead of driving can reduce your transportation emissions by up to 60%.</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Reduce home energy usage</Text>
              <Text style={styles.tipDescription}>Lowering your thermostat by 1°C can reduce heating emissions by about 8%.</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {entries.slice(0, 5).map((entry) => (
              <View key={entry.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityType}>{entry.activityType}</Text>
                    <Text style={styles.activityDate}>{new Date(entry.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.activityAmount}>{formatNumber(entry.carbonAmount)}</Text>
                </View>
                {entry.description && (
                  <Text style={styles.activityDescription}>{entry.description}</Text>
                )}
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(entry.category) }]}>
                  <Text style={styles.categoryTagText}>{entry.category}</Text>
                </View>
              </View>
            ))}
            
            {entries.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="eco" size={48} color="#CCCCCC" />
                <Text style={styles.emptyStateText}>No activities recorded yet</Text>
                <Text style={styles.emptyStateSubtext}>Start tracking your carbon footprint</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
      
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Carbon Footprint Entry</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryButtonsContainer}>
                {(['food', 'transportation', 'housing', 'products', 'services'] as FootprintCategory[]).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      newEntry.category === category && { backgroundColor: getCategoryColor(category) }
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, category })}
                  >
                    <Text 
                      style={[
                        styles.categoryButtonText,
                        newEntry.category === category && { color: 'white' }
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Activity Type</Text>
              <TextInput
                style={styles.input}
                value={newEntry.activityType}
                onChangeText={(text) => setNewEntry({ ...newEntry, activityType: text })}
                placeholder="e.g., Car Travel, Beef Consumption"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Carbon Amount (kg CO₂e)</Text>
              <TextInput
                style={styles.input}
                value={newEntry.carbonAmount}
                onChangeText={(text) => setNewEntry({ ...newEntry, carbonAmount: text })}
                placeholder="e.g., 5.2"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEntry.description}
                onChangeText={(text) => setNewEntry({ ...newEntry, description: text })}
                placeholder="Add details about this activity"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={newEntry.date}
                onChangeText={(text) => setNewEntry({ ...newEntry, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddEntry}
            >
              <Text style={styles.submitButtonText}>Add Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  summaryCard: {
    margin: 15,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 10,
  },
  summaryDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginVertical: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 5,
  },
  activeTimeFrame: {
    backgroundColor: '#4CAF50',
  },
  timeFrameText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTimeFrameText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  section: {
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  categoryTagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FootprintScreen;
