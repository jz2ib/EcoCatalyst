import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface CarbonAnalyticsCardProps {
  title: string;
  data: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }[];
  };
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  onPress?: () => void;
  formatYLabel?: (yLabel: string) => string;
}

const CarbonAnalyticsCard: React.FC<CarbonAnalyticsCardProps> = ({
  title,
  data,
  period,
  onPeriodChange,
  onPress,
  formatYLabel = (value) => `${value}`
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onPress && (
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        )}
      </View>
      
      {onPeriodChange && (
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'daily' && styles.activePeriod]}
            onPress={() => onPeriodChange('daily')}
          >
            <Text style={[styles.periodText, period === 'daily' && styles.activePeriodText]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'weekly' && styles.activePeriod]}
            onPress={() => onPeriodChange('weekly')}
          >
            <Text style={[styles.periodText, period === 'weekly' && styles.activePeriodText]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'monthly' && styles.activePeriod]}
            onPress={() => onPeriodChange('monthly')}
          >
            <Text style={[styles.periodText, period === 'monthly' && styles.activePeriodText]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, period === 'yearly' && styles.activePeriod]}
            onPress={() => onPeriodChange('yearly')}
          >
            <Text style={[styles.periodText, period === 'yearly' && styles.activePeriodText]}>Yearly</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <LineChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#4CAF50'
          },
          formatYLabel
        }}
        bezier
        style={styles.chart}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 16,
  },
  activePeriod: {
    backgroundColor: '#4CAF50',
  },
  periodText: {
    fontSize: 12,
    color: '#757575',
  },
  activePeriodText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default CarbonAnalyticsCard;
