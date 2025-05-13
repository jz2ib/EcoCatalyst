import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { useGamification, Achievement, UserAchievement } from '../../contexts/gamification/GamificationContext';
import { useAuth } from '../../contexts/AuthContext';
import LevelProgressCard from '../../components/gamification/LevelProgressCard';
import AchievementCard from '../../components/gamification/AchievementCard';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList, 'Profile'>>();
  const { user, logout } = useAuth();
  const { 
    userStats, 
    achievements, 
    userAchievements, 
    getCompletedAchievements,
    isLoading 
  } = useGamification();
  
  const [recentAchievements, setRecentAchievements] = useState<{
    achievement: Achievement;
    userAchievement: UserAchievement;
  }[]>([]);
  
  useEffect(() => {
    if (achievements.length > 0 && userAchievements.length > 0) {
      const completed = getCompletedAchievements();
      
      const recent = completed
        .sort((a, b) => b.completedAt - a.completedAt)
        .slice(0, 2)
        .map(ua => {
          const achievement = achievements.find(a => a.id === ua.achievementId);
          if (!achievement) return null;
          return { achievement, userAchievement: ua };
        })
        .filter(Boolean) as {
          achievement: Achievement;
          userAchievement: UserAchievement;
        }[];
      
      setRecentAchievements(recent);
    }
  }, [achievements, userAchievements, getCompletedAchievements]);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const displayName = user?.displayName || 'EcoCatalyst User';
  const email = user?.email || '';
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      
      {userStats && <LevelProgressCard userStats={userStats} />}
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats?.productsScanned || 0}</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getCompletedAchievements().length}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats?.carbonSaved ? `${Math.round(userStats.carbonSaved)}kg` : '0kg'}</Text>
          <Text style={styles.statLabel}>CO₂ Saved</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialIcons name="chevron-right" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        
        {recentAchievements.length > 0 ? (
          recentAchievements.map(({ achievement, userAchievement }) => (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement}
              userAchievement={userAchievement}
            />
          ))
        ) : (
          <View style={styles.emptyAchievements}>
            <MaterialIcons name="emoji-events" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>No achievements yet</Text>
            <Text style={styles.emptySubtext}>Complete activities to earn achievements</Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="person" size={24} color="#757575" style={styles.settingIcon} />
          <Text style={styles.settingText}>Account Information</Text>
          <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <MaterialIcons name="leaderboard" size={24} color="#757575" style={styles.settingIcon} />
          <Text style={styles.settingText}>Leaderboard</Text>
          <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="notifications" size={24} color="#757575" style={styles.settingIcon} />
          <Text style={styles.settingText}>Notification Preferences</Text>
          <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="privacy-tip" size={24} color="#757575" style={styles.settingIcon} />
          <Text style={styles.settingText}>Privacy Settings</Text>
          <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="help" size={24} color="#757575" style={styles.settingIcon} />
          <Text style={styles.settingText}>Help &amp; Support</Text>
          <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="info" size={24} color="#757575" style={styles.settingIcon} />
          <Text style={styles.settingText}>About EcoCatalyst</Text>
          <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="#F44336" style={styles.settingIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 4,
  },
  emptyAchievements: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  achievementBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementBadgeText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    flex: 1,
  },
});

export default ProfileScreen;
