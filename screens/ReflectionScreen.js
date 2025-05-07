import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXP } from '../contexts/XPContext';

const ReflectionScreen = () => {
  const { isPremium } = useXP();
  const [completedGoals, setCompletedGoals] = useState([]);
  const [reflections, setReflections] = useState({});
  const [expanded, setExpanded] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchCompletedGoals = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const db = getFirestore();
      const q = query(collection(db, 'completedGoals'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedGoals(data);

      // Sync completed goals to Firestore
      for (const goal of data) {
        await setDoc(doc(db, 'completedGoals', goal.id), goal, { merge: true });
      }

      // Load saved reflection drafts
      const drafts = await AsyncStorage.getItem('reflectionDrafts');
      if (drafts) {
        setReflections(JSON.parse(drafts));
      }
    };

    fetchCompletedGoals();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const db = getFirestore();
      const q = query(collection(db, 'completedGoals'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedGoals(data);

      for (const goal of data) {
        await setDoc(doc(db, 'completedGoals', goal.id), goal, { merge: true });
      }

      const drafts = await AsyncStorage.getItem('reflectionDrafts');
      if (drafts) {
        setReflections(JSON.parse(drafts));
      }
    } catch (err) {
      console.warn("⚠️ Error refreshing reflections:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveReflection = async (goalId) => {
    const db = getFirestore();
    const goalRef = doc(db, 'completedGoals', goalId);
    const reflection = reflections[goalId];

    await updateDoc(goalRef, { reflection });
    const updatedDrafts = { ...reflections, [goalId]: '' };
    await AsyncStorage.setItem('reflectionDrafts', JSON.stringify(updatedDrafts));
    setReflections(prev => ({ ...prev, [goalId]: '' }));
    alert('Reflection saved!');
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReopenGoal = async (goal) => {
    const db = getFirestore();
    const goalRef = doc(db, 'goals', goal.id);
    const completedRef = doc(db, 'completedGoals', goal.id);

    try {
      const docSnap = await getDoc(goalRef);
      if (docSnap.exists()) {
        await updateDoc(goalRef, { completed: false });
      } else {
        await setDoc(goalRef, { ...goal, completed: false });
      }

      await deleteDoc(completedRef);
      setCompletedGoals(prev => prev.filter(g => g.id !== goal.id));
    } catch (err) {
      console.warn('⚠️ Failed to reopen goal:', err);
    }
  };

  // Count completed goals that have a saved reflection
  const goalsWithReflections = completedGoals.filter(goal => !!goal.reflection).length;

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>🏆 Reflections</Text>
        <Text style={styles.lockedMessage}>
          Reflections are a premium feature. Upgrade to unlock your completed goal history and reflection tools.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        🎯 Completed Goals ({completedGoals.length}) — with Reflections: {goalsWithReflections}
      </Text>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <FlatList
          data={completedGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.goalCard}>
              <Text
                style={styles.goalTitle}
                onPress={() => toggleExpand(item.id)}
              >
                {item.title || item.answers?.what || 'Unnamed Goal'} {expanded[item.id] ? '🔽' : '▶️'} {item.reflection ? '🏅' : ''}
              </Text>
              {expanded[item.id] && (
                <>
                  <Text style={styles.timestamp}>Completed: {new Date(item.completedAt).toLocaleDateString()}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Write a reflection..."
                    value={reflections[item.id] || ''}
                    onChangeText={async (text) => {
                      const updated = { ...reflections, [item.id]: text };
                      setReflections(updated);
                      await AsyncStorage.setItem('reflectionDrafts', JSON.stringify(updated));
                    }}
                  />
                  <Button title="Save Reflection" onPress={() => handleSaveReflection(item.id)} />
                  <Button title="Reopen Goal" onPress={() => handleReopenGoal(item)} />
                  {item.completedSteps && item.completedSteps.length > 0 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepHeader}>✅ Steps Completed:</Text>
                      {item.completedSteps.map((step, index) => (
                        <Text key={index} style={styles.stepText}>• {step.text || step.title || 'Unnamed Step'}</Text>
                      ))}
                    </View>
                  )}
                  {item.reflection && (
                    <Text style={styles.savedReflection}>📝 Your Reflection: {item.reflection}</Text>
                  )}
                </>
              )}
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop:60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  goalCard: { marginBottom: 20, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 },
  goalTitle: { fontSize: 18, fontWeight: '600' },
  timestamp: { fontSize: 14, color: '#555', marginVertical: 4 },
  input: { backgroundColor: '#fff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginBottom: 8 },
  savedReflection: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#444'
  },
  stepContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },
  stepHeader: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  stepText: {
    marginLeft: 8,
    marginBottom: 2,
    color: '#333'
  },
  lockedMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontStyle: 'italic',
  }
});

export default ReflectionScreen;