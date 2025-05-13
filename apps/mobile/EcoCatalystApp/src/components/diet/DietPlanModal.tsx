import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DietType } from '../../contexts/diet/DietContext';

interface DietPlanModalProps {
  visible: boolean;
  options: {
    dietType: string;
    durationDays: number;
    restrictions: string[];
    preferences: string[];
  };
  setOptions: React.Dispatch<React.SetStateAction<{
    dietType: string;
    durationDays: number;
    restrictions: string[];
    preferences: string[];
  }>>;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const dietTypes: { value: DietType; label: string; description: string }[] = [
  { 
    value: 'balanced', 
    label: 'Balanced', 
    description: 'A well-rounded diet with a variety of foods from all food groups.'
  },
  { 
    value: 'vegetarian', 
    label: 'Vegetarian', 
    description: 'Plant-based diet that excludes meat but may include dairy and eggs.'
  },
  { 
    value: 'vegan', 
    label: 'Vegan', 
    description: 'Plant-based diet that excludes all animal products.'
  },
  { 
    value: 'keto', 
    label: 'Keto', 
    description: 'High-fat, low-carb diet that puts your body in a state of ketosis.'
  },
  { 
    value: 'paleo', 
    label: 'Paleo', 
    description: 'Based on foods similar to what might have been eaten during the Paleolithic era.'
  },
  { 
    value: 'mediterranean', 
    label: 'Mediterranean', 
    description: 'Based on the traditional foods of Mediterranean countries.'
  }
];

const DietPlanModal: React.FC<DietPlanModalProps> = ({ 
  visible, 
  options, 
  setOptions, 
  onClose, 
  onSubmit,
  isLoading
}) => {
  const [newRestriction, setNewRestriction] = useState('');
  const [newPreference, setNewPreference] = useState('');
  
  const handleAddRestriction = () => {
    if (newRestriction.trim() === '') return;
    
    setOptions(prev => ({
      ...prev,
      restrictions: [...prev.restrictions, newRestriction.trim()]
    }));
    
    setNewRestriction('');
  };
  
  const handleRemoveRestriction = (index: number) => {
    setOptions(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddPreference = () => {
    if (newPreference.trim() === '') return;
    
    setOptions(prev => ({
      ...prev,
      preferences: [...prev.preferences, newPreference.trim()]
    }));
    
    setNewPreference('');
  };
  
  const handleRemovePreference = (index: number) => {
    setOptions(prev => ({
      ...prev,
      preferences: prev.preferences.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Diet Plan</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Diet Type</Text>
            <View style={styles.dietTypeContainer}>
              {dietTypes.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.dietTypeButton,
                    options.dietType === type.value && styles.dietTypeButtonSelected
                  ]}
                  onPress={() => setOptions(prev => ({ ...prev, dietType: type.value }))}
                >
                  <Text 
                    style={[
                      styles.dietTypeButtonText,
                      options.dietType === type.value && styles.dietTypeButtonTextSelected
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.dietTypeDescription}>
              {dietTypes.find(type => type.value === options.dietType)?.description}
            </Text>
            
            <Text style={styles.sectionTitle}>Duration (Days)</Text>
            <View style={styles.durationContainer}>
              {[3, 7, 14, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.durationButton,
                    options.durationDays === days && styles.durationButtonSelected
                  ]}
                  onPress={() => setOptions(prev => ({ ...prev, durationDays: days }))}
                >
                  <Text 
                    style={[
                      styles.durationButtonText,
                      options.durationDays === days && styles.durationButtonTextSelected
                    ]}
                  >
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newRestriction}
                onChangeText={setNewRestriction}
                placeholder="Add a dietary restriction..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddRestriction}>
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tagsContainer}>
              {options.restrictions.map((restriction, index) => (
                <View key={`restriction-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{restriction}</Text>
                  <TouchableOpacity onPress={() => handleRemoveRestriction(index)}>
                    <MaterialIcons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Food Preferences</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newPreference}
                onChangeText={setNewPreference}
                placeholder="Add a food preference..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddPreference}>
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tagsContainer}>
              {options.preferences.map((preference, index) => (
                <View key={`preference-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{preference}</Text>
                  <TouchableOpacity onPress={() => handleRemovePreference(index)}>
                    <MaterialIcons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Plan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
    maxHeight: '70%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  dietTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dietTypeButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  dietTypeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  dietTypeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  dietTypeButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  dietTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  durationButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '22%',
  },
  durationButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  durationButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  durationButtonTextSelected: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#689F38',
    fontSize: 14,
    marginRight: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DietPlanModal;
