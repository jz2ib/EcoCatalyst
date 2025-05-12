import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const DietScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: 'Hello! I\'m your EcoDiet assistant. How can I help you with sustainable food choices today?', isUser: false },
  ]);

  const sendMessage = () => {
    if (message.trim() === '') return;
    
    const newUserMessage = { id: chatHistory.length + 1, text: message, isUser: true };
    setChatHistory([...chatHistory, newUserMessage]);
    
    setMessage('');
    
    setTimeout(() => {
      let response = '';
      
      if (message.toLowerCase().includes('vegetarian')) {
        response = 'A vegetarian diet can reduce your carbon footprint by up to 30% compared to a meat-heavy diet. Would you like some vegetarian meal suggestions?';
      } else if (message.toLowerCase().includes('meal plan') || message.toLowerCase().includes('diet plan')) {
        response = 'I can help you create a sustainable meal plan. What are your dietary preferences and restrictions?';
      } else if (message.toLowerCase().includes('carbon footprint') || message.toLowerCase().includes('environmental impact')) {
        response = 'Food production accounts for about 25% of global greenhouse gas emissions. Choosing local, plant-based foods can significantly reduce your environmental impact.';
      } else {
        response = 'I\'m here to help you make sustainable food choices. You can ask me about eco-friendly diets, meal plans, or the environmental impact of different foods.';
      }
      
      const newAiMessage = { id: chatHistory.length + 2, text: response, isUser: false };
      setChatHistory([...chatHistory, newUserMessage, newAiMessage]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EcoDiet Assistant</Text>
        <Text style={styles.subtitle}>AI-powered sustainable diet planning</Text>
      </View>
      
      <ScrollView style={styles.chatContainer}>
        {chatHistory.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageBubble, 
              msg.isUser ? styles.userMessage : styles.aiMessage
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about sustainable food choices..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
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
});

export default DietScreen;
