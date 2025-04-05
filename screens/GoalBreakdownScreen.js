import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const GoalBreakdownScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, answers, goalId } = route.params || {};
  const [steps, setSteps] = useState([]);
  const [stepText, setStepText] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [editingStepId, setEditingStepId] = useState(null);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const priorityOptions = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const fetchSteps = async () => {
    if (!auth.currentUser || !goalId) return;
    try {
      const q = query(
        collection(db, 'steps'),
        where('userId', '==', auth.currentUser.uid),
        where('goalId', '==', goalId)
      );
      const querySnapshot = await getDocs(q);
      const fetchedSteps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSteps(fetchedSteps.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching steps:', error);
      Alert.alert('Error', 'Failed to load steps.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setStepText('');
      setUrgency('Medium');
      setDeadline('');
      setEditingStepId(null);
      setShowPriorityPicker(false);
      fetchSteps();
    }, [goalId])
  );

  const addOrUpdateStep = async () => {
    if (!stepText.trim()) {
      Alert.alert('Error', 'Please enter a step description.');
      return;
    }
    if (!goalId) {
      Alert.alert('Error', 'Steps must be attached to a goal.');
      return;
    }

    const stepData = {
      userId: auth.currentUser.uid,
      goalId: goalId,
      categoryColor: category?.color || '#000000',
      categoryName: category?.name || 'Unknown',
      text: stepText,
      urgency: urgency,
      deadline: deadline || null,
      completed: false,
      order: editingStepId ? steps.find(s => s.id === editingStepId)?.order : steps.length,
      createdAt: new Date().toISOString(),
    };

    try {
      if (editingStepId) {
        const stepRef = doc(db, 'steps', editingStepId);
        await updateDoc(stepRef, stepData);
        setEditingStepId(null);
      } else {
        await addDoc(collection(db, 'steps'), stepData);
        if (deadline) {
          await scheduleNotification(stepData, new Date(deadline));
        }
      }
      setStepText('');
      setUrgency('Medium');
      setDeadline('');
      setShowPriorityPicker(false);
      fetchSteps();
    } catch (error) {
      console.error('Error saving step:', error);
      Alert.alert('Error', 'Failed to save step.');
    }
  };

  const editStep = (step) => {
    setStepText(step.text);
    setUrgency(step.urgency);
    setDeadline(step.deadline || '');
    setEditingStepId(step.id);
  };

  const deleteStep = async (stepId) => {
    try {
      await deleteDoc(doc(db, 'steps', stepId));
      fetchSteps();
    } catch (error) {
      console.error('Error deleting step:', error);
      Alert.alert('Error', 'Failed to delete step.');
    }
  };

  const moveStep = async (index, direction) => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    newSteps.forEach((step, idx) => (step.order = idx));

    const batch = writeBatch(db);
    try {
      for (const step of newSteps) {
        const stepRef = doc(db, 'steps', step.id);
        batch.update(stepRef, { order: step.order });
      }
      await batch.commit();
      setSteps(newSteps);
    } catch (error) {
      console.error('Error updating step order:', error);
      Alert.alert('Error', 'Failed to reorder steps.');
    }
  };

  const handleSaveSteps = () => {
    if (steps.length === 0) {
      Alert.alert('Error', 'Please add at least one step.');
      return;
    }
    Alert.alert('Success', 'Your steps have been saved!');
    navigation.navigate('Tabs', { screen: 'Progress' });
  };

  const renderStepItem = ({ item, index }) => (
    <View style={[styles.stepItem, { borderColor: category?.color || '#000000' }]}>
      <Text style={styles.stepText} allowFontScaling={true}>{item.text}</Text>
      <Text style={styles.stepDetail} allowFontScaling={true}>
        Priority: {item.urgency} | Deadline: {item.deadline || 'None'}
      </Text>
      <View style={styles.stepActions}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => moveStep(index, 'up')}
          disabled={index === 0}
        >
          <Text style={styles.orderButtonText} allowFontScaling={true}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => moveStep(index, 'down')}
          disabled={index === steps.length - 1}
        >
          <Text style={styles.orderButtonText} allowFontScaling={true}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editStep(item)}
        >
          <Text style={styles.editButtonText} allowFontScaling={true}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteStep(item.id)}
        >
          <Text style={styles.deleteButtonText} allowFontScaling={true}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: category?.color || '#000000' }]} allowFontScaling={true}>
        Break Down Your Goal: {answers?.what || 'No goal'}
      </Text>

      <Text style={styles.label} allowFontScaling={true}>Step Description:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter step description"
        value={stepText}
        onChangeText={setStepText}
      />

      <Text style={styles.label} allowFontScaling={true}>Priority:</Text>
      <TouchableOpacity
        style={styles.priorityButton}
        onPress={() => setShowPriorityPicker(!showPriorityPicker)}
      >
        <Text style={styles.priorityButtonText} allowFontScaling={true}>{urgency}</Text>
      </TouchableOpacity>
      {showPriorityPicker && (
        <View style={styles.priorityDropdown}>
          {priorityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.priorityItem}
              onPress={() => {
                setUrgency(option.value);
                setShowPriorityPicker(false);
              }}
            >
              <Text style={styles.priorityItemText} allowFontScaling={true}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      // TODO: Consider validating or parsing the deadline input to ensure it's a valid date format (e.g., with a date picker or regex check)
      <Text style={styles.label} allowFontScaling={true}>Deadline (e.g., YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter deadline"
        value={deadline}
        onChangeText={setDeadline}
      />

      <TouchableOpacity style={styles.addButton} onPress={addOrUpdateStep}>
        <Text style={styles.addButtonText} allowFontScaling={true}>{editingStepId ? 'Update Step' : 'Add Step'}</Text>
      </TouchableOpacity>

      <FlatList
        data={steps}
        keyExtractor={(item) => item.id}
        renderItem={renderStepItem}
        ListEmptyComponent={<Text style={styles.emptyText} allowFontScaling={true}>No steps added yet.</Text>}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSteps}>
        <Text style={styles.saveButtonText} allowFontScaling={true}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
    includeFontPadding: false,
  },
  priorityButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  priorityButtonText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  priorityDropdown: {
    position: 'absolute',
    top: 200, // Adjust based on layout
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 1000,
    elevation: 5,
  },
  priorityItem: {
    padding: 10,
  },
  priorityItemText: {
    fontSize: 16,
    color: '#000',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepDetail: {
    fontSize: 16,
    color: '#666',
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  orderButton: {
    backgroundColor: '#8E8E93',
    padding: 5,
    borderRadius: 3,
    marginLeft: 5,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#FFA500',
    padding: 5,
    borderRadius: 3,
    marginLeft: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 5,
    borderRadius: 3,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoalBreakdownScreen;