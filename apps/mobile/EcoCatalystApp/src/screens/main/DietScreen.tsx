import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDiet, MealEntry, DietType } from '../../contexts/diet/DietContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import MealPlanCard from '../../components/diet/MealPlanCard';
import MealSuggestionCard from '../../components/diet/MealSuggestionCard';
import DietPlanModal from '../../components/diet/DietPlanModal';

const DietScreen: React.FC = () => {
  const { 
    chatHistory, 
    currentPlan, 
    mealEntries, 
    isLoading, 
    error, 
    sendChatMessage, 
    generateMealSuggestion,
    createAIDietPlan
  } = useDiet();
  
  const [message, setMessage] = useState('');
  const [showDietPlanModal, setShowDietPlanModal] = useState(false);
  const [showMealSuggestion, setShowMealSuggestion] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<MealEntry | null>(null);
  const [dietPlanOptions, setDietPlanOptions] = useState<{
    dietType: string;
    durationDays: number;
    restrictions: string[];
    preferences: string[];
  }>({
    dietType: 'balanced',
    durationDays: 7,
    restrictions: [],
    preferences: []
  });
  
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);
  
  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    
    await sendChatMessage(message);
    setMessage('');
    
    if (message.toLowerCase().includes('suggest meal') || 
        message.toLowerCase().includes('meal suggestion') ||
        message.toLowerCase().includes('what should i eat')) {
      handleMealSuggestion();
    }
    
    if (message.toLowerCase().includes('create diet plan') || 
        message.toLowerCase().includes('make meal plan') ||
        message.toLowerCase().includes('plan my diet')) {
      setShowDietPlanModal(true);
    }
  };
  
  const handleMealSuggestion = async () => {
    const today = new Date().toISOString().split('T')[0];
    const meal = await generateMealSuggestion('lunch', today, 'balanced');
    
    if (meal) {
      setSuggestedMeal(meal);
      setShowMealSuggestion(true);
    }
  };
  
  const handleCreateDietPlan = async () => {
    const { dietType, durationDays, restrictions, preferences } = dietPlanOptions;
    
    const plan = await createAIDietPlan(
      dietType as DietType,
      durationDays,
      restrictions,
      preferences
    );
    
    setShowDietPlanModal(false);
    
    if (plan) {
      await sendChatMessage(`I've created a new ${dietType} diet plan for you called "${plan.name}". It includes meal suggestions for ${durationDays} days with a focus on sustainability.`);
    }
  };
  
  const renderChatMessage = (message) => {
    const isUser = message.sender === 'user';
    
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageBubble, 
          isUser ? styles.userMessage : styles.aiMessage
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
        {!isUser && message.content.includes('carbon footprint') && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Footprint')}
          >
            <Text style={styles.actionButtonText}>View Carbon Footprint</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EcoDiet Assistant</Text>
        <Text style={styles.subtitle}>AI-powered sustainable diet planning</Text>
      </View>
      
      {currentPlan && (
        <MealPlanCard plan={currentPlan} />
      )}
      
      <ScrollView 
        style={styles.chatContainer}
        ref={scrollViewRef}
      >
        {chatHistory.map(renderChatMessage)}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        )}
      </ScrollView>
      
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionIcon}
          onPress={() => setShowDietPlanModal(true)}
        >
          <MaterialIcons name="restaurant-menu" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Diet Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionIcon}
          onPress={handleMealSuggestion}
        >
          <MaterialIcons name="lightbulb" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Suggest Meal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionIcon}
          onPress={() => navigation.navigate('Footprint')}
        >
          <MaterialIcons name="eco" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Footprint</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about sustainable food choices..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSendMessage}
          disabled={isLoading}
        >
          <MaterialIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Diet Plan Modal */}
      <DietPlanModal
        visible={showDietPlanModal}
        options={dietPlanOptions}
        setOptions={setDietPlanOptions}
        onClose={() => setShowDietPlanModal(false)}
        onSubmit={handleCreateDietPlan}
        isLoading={isLoading}
      />
      
      {/* Meal Suggestion Modal */}
      {suggestedMeal && (
        <Modal
          visible={showMealSuggestion}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMealSuggestion(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Suggested Meal</Text>
                <TouchableOpacity onPress={() => setShowMealSuggestion(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <MealSuggestionCard meal={suggestedMeal} />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowMealSuggestion(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#E1F5FE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionIcon: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    margin: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
});

export default DietScreen;
