import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Share
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGamification, Achievement, UserAchievement, AchievementCategory } from '../../contexts/gamification/GamificationContext';
import { useNavigation } from '@react-navigation/native';
import AchievementCard from '../../components/gamification/AchievementCard';
import LevelProgressCard from '../../components/gamification/LevelProgressCard';

const AchievementsScreen: React.FC = () => {
  const { 
    achievements, 
    userAchievements, 
    userStats, 
    getAchievementsByCategory,
    getCompletedAchievements,
    getInProgressAchievements,
    isLoading 
  } = useGamification();
  
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const navigation = useNavigation();
  
  const filteredAchievements = () => {
    let filtered: { achievement: Achievement; userAchievement?: UserAchievement }[] = [];
    
    if (filter === 'completed') {
      const completed = getCompletedAchievements();
      filtered = completed.map(ua => {
        const achievement = achievements.find(a => a.id === ua.achievementId);
        if (!achievement) return null;
        return { achievement, userAchievement: ua };
      }).filter(Boolean) as { achievement: Achievement; userAchievement: UserAchievement }[];
    } else if (filter === 'in-progress') {
      filtered = getInProgressAchievements().map(item => ({
        achievement: item.achievement,
        userAchievement: item.userAchievement
      }));
    } else {
      filtered = achievements.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
        return { achievement, userAchievement };
      });
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.achievement.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      const aCompleted = a.userAchievement?.progress === 100;
      const bCompleted = b.userAchievement?.progress === 100;
      
      if (aCompleted && !bCompleted) return -1;
      if (!aCompleted && bCompleted) return 1;
      
      return a.achievement.title.localeCompare(b.achievement.title);
    });
  };
  
  const handleShare = async (achievement: Achievement) => {
    try {
      const result = await Share.share({
        message: `I just unlocked the "${achievement.title}" achievement in EcoCatalyst! 🌱 ${achievement.points} points for ${achievement.description}. Join me in making sustainable choices!`,
        title: 'Achievement Unlocked!'
      });
    } catch (error) {
      console.error('Error sharing achievement:', error);
    }
  };
  
  const renderCategoryButton = (category: AchievementCategory | 'all', label: string, icon: any) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton, 
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <MaterialIcons 
        name={icon} 
        size={20} 
        color={selectedCategory === category ? 'white' : '#757575'} 
      />
      <Text 
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.selectedCategoryButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Achievements</Text>
        <TouchableOpacity 
          style={styles.leaderboardButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <MaterialIcons name="leaderboard" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      
      {userStats && (
        <LevelProgressCard userStats={userStats} />
      )}
      
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {renderCategoryButton('all', 'All', 'apps')}
          {renderCategoryButton('scanner', 'Scanner', 'qr-code-scanner')}
          {renderCategoryButton('footprint', 'Footprint', 'eco')}
          {renderCategoryButton('diet', 'Diet', 'restaurant')}
          {renderCategoryButton('community', 'Community', 'people')}
          {renderCategoryButton('streak', 'Streak', 'local-fire-department')}
        </ScrollView>
        
        <View style={styles.statusFilterContainer}>
          <TouchableOpacity 
            style={[
              styles.statusButton, 
              filter === 'all' && styles.selectedStatusButton
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.statusButtonText,
              filter === 'all' && styles.selectedStatusButtonText
            ]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusButton, 
              filter === 'completed' && styles.selectedStatusButton
            ]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[
              styles.statusButtonText,
              filter === 'completed' && styles.selectedStatusButtonText
            ]}>Completed</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusButton, 
              filter === 'in-progress' && styles.selectedStatusButton
            ]}
            onPress={() => setFilter('in-progress')}
          >
            <Text style={[
              styles.statusButtonText,
              filter === 'in-progress' && styles.selectedStatusButtonText
            ]}>In Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredAchievements()}
          renderItem={({ item }) => (
            <AchievementCard 
              achievement={item.achievement}
              userAchievement={item.userAchievement}
              onShare={() => handleShare(item.achievement)}
            />
          )}
          keyExtractor={(item) => item.achievement.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  leaderboardButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingBottom: 8,
    marginBottom: 8,
    elevation: 2,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  selectedStatusButton: {
    backgroundColor: '#E8F5E9',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedStatusButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AchievementsScreen;
