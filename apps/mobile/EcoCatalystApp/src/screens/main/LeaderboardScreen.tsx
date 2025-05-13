import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGamification, LeaderboardEntry } from '../../contexts/gamification/GamificationContext';
import { useNavigation } from '@react-navigation/native';

const LeaderboardScreen: React.FC = () => {
  const { getLeaderboard, userStats, isLoading } = useGamification();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const navigation = useNavigation();
  
  useEffect(() => {
    loadLeaderboard();
  }, [timeFrame]);
  
  const loadLeaderboard = async () => {
    const data = await getLeaderboard(20);
    setLeaderboard(data);
  };
  
  const getUserRank = () => {
    if (!userStats || leaderboard.length === 0) return 'N/A';
    
    const userRank = leaderboard.findIndex(entry => entry.userId === userStats.userId);
    return userRank >= 0 ? userRank + 1 : 'N/A';
  };
  
  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = userStats && item.userId === userStats.userId;
    const rank = index + 1;
    
    return (
      <View style={[
        styles.leaderboardItem, 
        isCurrentUser && styles.currentUserItem
      ]}>
        <View style={styles.rankContainer}>
          {rank <= 3 ? (
            <View style={[styles.topRankBadge, { 
              backgroundColor: 
                rank === 1 ? '#FFD700' : 
                rank === 2 ? '#C0C0C0' : 
                '#CD7F32'
            }]}>
              <Text style={styles.topRankText}>{rank}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>{rank}</Text>
          )}
        </View>
        
        <View style={styles.avatarContainer}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {item.displayName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.userInfoContainer}>
          <Text style={styles.displayName}>
            {item.displayName}
            {isCurrentUser && <Text style={styles.youText}> (You)</Text>}
          </Text>
          <Text style={styles.levelText}>Level {item.level}</Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{item.totalPoints}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
      </View>
      
      <View style={styles.timeFrameSelector}>
        <TouchableOpacity 
          style={[
            styles.timeFrameButton, 
            timeFrame === 'weekly' && styles.activeTimeFrame
          ]}
          onPress={() => setTimeFrame('weekly')}
        >
          <Text style={[
            styles.timeFrameText,
            timeFrame === 'weekly' && styles.activeTimeFrameText
          ]}>Weekly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.timeFrameButton, 
            timeFrame === 'monthly' && styles.activeTimeFrame
          ]}
          onPress={() => setTimeFrame('monthly')}
        >
          <Text style={[
            styles.timeFrameText,
            timeFrame === 'monthly' && styles.activeTimeFrameText
          ]}>Monthly</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.timeFrameButton, 
            timeFrame === 'allTime' && styles.activeTimeFrame
          ]}
          onPress={() => setTimeFrame('allTime')}
        >
          <Text style={[
            styles.timeFrameText,
            timeFrame === 'allTime' && styles.activeTimeFrameText
          ]}>All Time</Text>
        </TouchableOpacity>
      </View>
      
      {userStats && (
        <View style={styles.userRankCard}>
          <Text style={styles.userRankTitle}>Your Rank</Text>
          <View style={styles.userRankContent}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{getUserRank()}</Text>
            </View>
            <View style={styles.userRankInfo}>
              <Text style={styles.userRankPoints}>{userStats.totalPoints} points</Text>
              <Text style={styles.userRankLevel}>Level {userStats.level}</Text>
            </View>
          </View>
        </View>
      )}
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.userId}
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
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    marginBottom: 16,
    elevation: 2,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  activeTimeFrame: {
    backgroundColor: '#E8F5E9',
  },
  timeFrameText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTimeFrameText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  userRankCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  userRankTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userRankInfo: {
    flex: 1,
  },
  userRankPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userRankLevel: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  leaderboardItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 1,
  },
  currentUserItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
  },
  topRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
  },
  userInfoContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  youText: {
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  levelText: {
    fontSize: 14,
    color: '#757575',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#757575',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LeaderboardScreen;
