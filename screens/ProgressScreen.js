import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Share, Alert } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import XPConfetti from '../utils/xp';
// import ConfettiCannon from 'react-native-confetti-cannon';

const ProgressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [goals, setGoals] = useState([]);
  const [steps, setSteps] = useState([]);
  const [sortType, setSortType] = useState('default');
  const [error, setError] = useState(null);
  // const [showConfetti, setShowConfetti] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);

  const fetchData = async () => {
    if (!auth.currentUser) {
      navigation.navigate('SignIn');
      return;
    }

    try {
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', auth.currentUser.uid)
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      const userGoals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(userGoals);

      const stepsQuery = query(
        collection(db, 'steps'),
        where('userId', '==', auth.currentUser.uid)
      );
      const stepsSnapshot = await getDocs(stepsQuery);
      const userSteps = stepsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSteps(userSteps);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigation]);
  
  useEffect(() => {
    const loadXP = async () => {
      const storedXP = await AsyncStorage.getItem('userXP');
      setCurrentXP(storedXP ? parseInt(storedXP, 10) : 0);
    };
    loadXP();
  }, [steps]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // TODO: Consider moving XP tracking to Firestore instead of AsyncStorage to support cross-device sync
  const toggleStepCompletion = async (stepId, currentStatus) => {
    try {
      const stepRef = doc(db, 'steps', stepId);
      await updateDoc(stepRef, {
        completed: !currentStatus,
      });

      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, completed: !currentStatus } : step
        )
      );

      if (!currentStatus) { // step was just completed
        try {
          const storedXP = await AsyncStorage.getItem('userXP');
          let xp = storedXP ? parseInt(storedXP, 10) : 0;
          xp += 10;
          // TODO: Consider syncing XP to Firestore for cross-device tracking and persistence
          await AsyncStorage.setItem('userXP', xp.toString());
          Alert.alert("Step Completed", `You earned 10 XP! Total XP: ${xp}`);

          if (xp % 100 === 0) {
       //     setShowConfetti(true);
     //       setTimeout(() => setShowConfetti(false), 4000);
          }
        } catch (err) {
          console.error('Error updating XP:', err);
        }
      }
    } catch (error) {
      console.error('Error updating step completion:', error);
      setError(error.message);
    }
  };

  const shareGoalProgress = async (goal) => {
    const completedSteps = steps.filter(step => step.categoryColor === goal.categoryColor && step.completed).length;
    const totalSteps = steps.filter(step => step.categoryColor === goal.categoryColor).length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const message = <Text>I'm {progress}% done with my goal: "{goal.answers.what}" in {goal.categoryName}!</Text>;

    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing goal:', error);
      setError(error.message);
    }
  };

  const getPriorityValue = (urgency) => {
    switch (urgency) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 2; // Fallback for old numeric or undefined values
    }
  };

  const getCombinedData = () => {
    const categoryFilter = route.params?.categoryFilter;
    let filteredGoals = goals;
    if (categoryFilter) {
      filteredGoals = goals.filter(goal => goal.categoryName === categoryFilter);
    }
  
    const combined = filteredGoals.map(goal => {
      const goalSteps = steps
        .filter(step => step.goalId === goal.id) // Filter by goalId
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const completedSteps = goalSteps.filter(step => step.completed).length;
      const totalSteps = goalSteps.length;
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      return { ...goal, steps: goalSteps, progress };
    });

    if (sortType === 'priority') {
      return combined.map(goal => ({
        ...goal,
        steps: [...goal.steps].sort((a, b) => getPriorityValue(b.urgency) - getPriorityValue(a.urgency)),
      }));
    } else if (sortType === 'deadline') {
      return combined.map(goal => ({
        ...goal,
        steps: [...goal.steps].sort((a, b) => (a.deadline || '') - (b.deadline || '')),
      }));
    } else if (sortType === 'category') {
      return [...combined].sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    }

    return combined;
  };

  const renderItem = ({ item }) => (
    <View style={styles.goalContainer}>
      <Text allowFontScaling={true} style={[styles.goalText, { color: item.categoryColor }]}>
        Goal: {item.answers.what || 'No goal'}
      </Text>
      <Text allowFontScaling={true} style={styles.goalDetail}>Category: {item.categoryName}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%`, backgroundColor: item.categoryColor }]} />
        <Text allowFontScaling={true} style={styles.progressText}>{`${Math.round(item.progress)}% Complete`}</Text>
      </View>
      {item.steps.length > 0 ? (
        <View>
          <Text allowFontScaling={true} style={styles.stepsHeader}>Steps:</Text>
          {item.steps.map(step => (
            <View key={step.id} style={[styles.stepItem, { borderColor: item.categoryColor }]}>
              <View style={styles.stepRow}>
                <Text allowFontScaling={true} style={[styles.stepText, { color: step.completed ? '#888' : '#000' }]}>
                  {step.text}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { backgroundColor: step.completed ? '#FF3B30' : '#34C759' },
                  ]}
                  onPress={() => toggleStepCompletion(step.id, step.completed)}
                >
                  <Text allowFontScaling={true} style={styles.toggleButtonText}>
                    {step.completed ? 'Undo' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text allowFontScaling={true} style={[styles.stepDetail, { color: step.completed ? '#888' : '#666' }]}>
                Priority: {step.urgency} | Deadline: {step.deadline ? new Date(step.deadline).toLocaleDateString() : 'No deadline'} | Completed: {step.completed ? 'Yes' : 'No'}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text allowFontScaling={true} style={styles.noStepsText}>No steps yet for this goal.</Text>
      )}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => shareGoalProgress(item)}
      >
        <Text allowFontScaling={true} style={styles.shareButtonText}>Share Progress</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
     // {showConfetti && <ConfettiCannon count={80} origin={{x: -10, y: 0}} />}
      <Text allowFontScaling={true} style={styles.header}>Progress Overview</Text>
      {error && <Text allowFontScaling={true} style={styles.errorText}>Error: {error}</Text>}
      <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortType('default')}>
          <Text allowFontScaling={true} style={styles.sortButtonText}>Default</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortType('priority')}>
          <Text allowFontScaling={true} style={styles.sortButtonText}>Priority</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortType('deadline')}>
          <Text allowFontScaling={true} style={styles.sortButtonText}>Deadline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortType('category')}>
          <Text allowFontScaling={true} style={styles.sortButtonText}>Category</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={getCombinedData()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text allowFontScaling={true} style={styles.emptyText}>No goals or steps yet.</Text>}
      />
     // <XPConfetti currentXP={currentXP} />
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text allowFontScaling={true} style={styles.navButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sortButton: {
    backgroundColor: '#8E8E93',
    padding: 10,
    borderRadius: 5,
  },
  sortButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  goalDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    marginTop: 2,
  },
  stepsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  stepItem: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  stepDetail: {
    fontSize: 16,
  },
  toggleButton: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noStepsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;