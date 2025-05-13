import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFootprint, FootprintCategory } from '../../contexts/footprint/FootprintContext';
import CarbonGoalCard from '../../components/footprint/CarbonGoalCard';
import { useNavigation } from '@react-navigation/native';

const GoalSettingScreen: React.FC = () => {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    isLoading, 
    error 
  } = useFootprint();
  
  const navigation = useNavigation();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '10',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    category: 'transportation',
  });
  
  const categories: FootprintCategory[] = ['transportation', 'food', 'housing', 'products', 'services', 'other'];
  
  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }
    
    if (isNaN(parseFloat(newGoal.targetAmount)) || parseFloat(newGoal.targetAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }
    
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          title: newGoal.title,
          description: newGoal.description,
          targetAmount: parseFloat(newGoal.targetAmount),
          deadline: newGoal.deadline,
          category: newGoal.category as FootprintCategory,
        });
      } else {
        await addGoal({
          title: newGoal.title,
          description: newGoal.description,
          targetAmount: parseFloat(newGoal.targetAmount),
          deadline: newGoal.deadline,
          category: newGoal.category as FootprintCategory,
          currentAmount: 0
        });
      }
      
      setModalVisible(false);
      resetForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };
  
  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
    });
    setModalVisible(true);
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          }
        },
      ]
    );
  };
  
  const resetForm = () => {
    setNewGoal({
      title: '',
      description: '',
      targetAmount: '10',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'transportation',
    });
    setEditingGoal(null);
  };
  
  const renderGoalsByStatus = (completed: boolean) => {
    const filteredGoals = goals.filter(goal => goal.isCompleted === completed);
    
    if (filteredGoals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name={completed ? "emoji-events" : "track-changes"} 
            size={48} 
            color="#CCCCCC" 
          />
          <Text style={styles.emptyText}>
            {completed 
              ? "No completed goals yet" 
              : "No active goals yet"
            }
          </Text>
          {!completed && (
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Create your first goal</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return filteredGoals.map(goal => (
      <CarbonGoalCard
        key={goal.id}
        goal={goal}
        onPress={() => handleEditGoal(goal)}
      />
    ));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carbon Reduction Goals</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          {renderGoalsByStatus(false)}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Goals</Text>
          {renderGoalsByStatus(true)}
        </View>
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={newGoal.title}
                onChangeText={(text) => setNewGoal({...newGoal, title: text})}
                placeholder="e.g., Reduce transportation emissions"
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({...newGoal, description: text})}
                placeholder="Describe your goal..."
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Target Amount (kg CO₂e)</Text>
              <TextInput
                style={styles.input}
                value={newGoal.targetAmount}
                onChangeText={(text) => setNewGoal({...newGoal, targetAmount: text})}
                keyboardType="numeric"
                placeholder="10"
              />
              
              <Text style={styles.inputLabel}>Deadline</Text>
              <TextInput
                style={styles.input}
                value={newGoal.deadline}
                onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
                placeholder="YYYY-MM-DD"
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      newGoal.category === category && styles.selectedCategory
                    ]}
                    onPress={() => setNewGoal({...newGoal, category})}
                  >
                    <Text 
                      style={[
                        styles.categoryText,
                        newGoal.category === category && styles.selectedCategoryText
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              {editingGoal && (
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => {
                    setModalVisible(false);
                    handleDeleteGoal(editingGoal.id);
                  }}
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddGoal}
              >
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyContainer: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default GoalSettingScreen;
