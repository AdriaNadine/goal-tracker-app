import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { scheduleNotification } from '../utils/notifications';
import { scheduleMotivationalReminder } from '../utils/notifications';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const GoalsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const category = route.params?.category || { name: "Unknown", color: "#000000" };
  const goalToEdit = route.params?.goalToEdit || null;
  const templateAnswers = route.params?.templateAnswers || null;
  const [answers, setAnswers] = useState({
    what: '',
    why: '',
    when: '',
  });
  const [reminderTime, setReminderTime] = useState('');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let initialAnswers = {
        what: '',
        why: '',
        when: '',
      };

      if (goalToEdit) {
        initialAnswers = goalToEdit.answers || initialAnswers;
      } else if (templateAnswers) {
        initialAnswers = {
          what: templateAnswers.what || '',
          why: templateAnswers.why || '',
          when: templateAnswers.when || '',
        };
      }

      const isDifferent = Object.keys(initialAnswers).some(
        key => initialAnswers[key] !== answers[key]
      );

      if (isDifferent) {
        setAnswers(initialAnswers);
      }
    }, [goalToEdit, templateAnswers, category])
  );

  const handleAnswerChange = (question, text) => {
    setAnswers({ ...answers, [question]: text });
  };

  const handleSubmit = async () => {
    const hasAnswers = Object.values(answers).some(answer => answer.trim() !== '');
    if (category.name === "Unknown") {
      Alert.alert('Category Required', 'Please select a category before creating a goal.');
      return;
    }
    if (!hasAnswers) {
      alert('Please answer at least one question before proceeding.');
      return;
    }
  
    if (!auth.currentUser) {
      Alert.alert('Error', 'No authenticated user found.');
      return;
    }
  
    try {
      let goalId;
      if (goalToEdit && goalToEdit.id) {
        const goalRef = doc(db, 'goals', goalToEdit.id);
        await updateDoc(goalRef, {
          answers: answers,
          updatedAt: new Date().toISOString(),
        });
        goalId = goalToEdit.id;
      } else {
        const docRef = await addDoc(collection(db, 'goals'), {
          userId: auth.currentUser.uid,
          categoryId: category.id || 'unknown',
          categoryName: category.name,
          categoryColor: category.color,
          answers: answers,
          createdAt: new Date().toISOString(),
        });
        goalId = docRef.id; // Get the newly created goal's ID
        if (answers.when) {
          await scheduleNotification(
            {
              id: goalId,
              title: answers.what,
            },
            new Date(answers.when)
          );
          await scheduleMotivationalReminder();
        }
        if (reminderTime) {
          await scheduleNotification(
            {
              id: `${goalId}-reminder`,
              title: 'Reminder for your goal',
              body: `Don't forget to work on: ${answers.what}`,
            },
            new Date(reminderTime)
          );
        }
      }
      // TODO: Consider using 'why' answers to enrich goal reflection features or dashboard insights.
      Alert.alert(
        'Success',
        'Your goal has been saved!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs', {
              screen: 'Steps',
              params: { category, answers, goalId }
            }),
          }
        ]
      );
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', `Failed to save goals: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={[styles.header, { color: category.color }]} allowFontScaling={true}>
          {goalToEdit ? 'Edit Goal' : 'Answer the Following Questions:'}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Categories' })}
        >
          <Text style={styles.navButtonText} allowFontScaling={true}>Back to Categories</Text>
        </TouchableOpacity>

        <Text style={styles.question} allowFontScaling={true}>What is your goal?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your goal..."
          value={answers.what}
          onChangeText={(text) => handleAnswerChange('what', text)}
        />

        <Text style={styles.question} allowFontScaling={true}>Why do you want to achieve this goal?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your reason..."
          value={answers.why}
          onChangeText={(text) => handleAnswerChange('why', text)}
        />

        <Text style={styles.question} allowFontScaling={true}>When will you achieve this goal?</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text allowFontScaling={true}>{answers.when ? answers.when : 'Select a date'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={answers.when ? new Date(answers.when) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const isoDate = selectedDate.toISOString().split('T')[0];
                handleAnswerChange('when', isoDate);
              }
            }}
          />
        )}

        <Text style={styles.question} allowFontScaling={true}>
          When do you want to be reminded about your goal?
        </Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowReminderPicker(true)}
        >
          <Text allowFontScaling={true}>
            {reminderTime ? reminderTime : 'Select reminder date & time'}
          </Text>
        </TouchableOpacity>
        {showReminderPicker && (
          <DateTimePicker
            value={reminderTime ? new Date(reminderTime) : new Date()}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowReminderPicker(false);
              if (selectedDate) {
                const isoDateTime = selectedDate.toISOString();
                setReminderTime(isoDateTime);
              }
            }}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText} allowFontScaling={true}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    includeFontPadding: false,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#8E8E93',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default GoalsScreen;