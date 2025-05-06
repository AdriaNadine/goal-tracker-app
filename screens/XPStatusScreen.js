import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView, Image, Animated, ScrollView } from 'react-native';
import usePremiumStatusHook from '../hooks/usePremiumStatus';
import { useXP } from '../context/XPContext';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const levelThreshold = 100;

const XPStatusScreen = () => {
  const [isPremium] = usePremiumStatusHook();
  const { currentXP, awardXP } = useXP();

  // 🔍 Debug logging for blank screen diagnosis
  console.log("🔍 XPStatusScreen mounted");
  console.log("👤 isPremium:", isPremium);
  console.log("📊 currentXP from context:", currentXP);

  const [reward, setReward] = useState('');
  const [savedReward, setSavedReward] = useState('');
  // State for selecting target level to set reward
  const [targetLevel, setTargetLevel] = useState('1');
  // Preset rewards for certain levels
  const presetRewards = {
    1: "🎉 Treat yourself to something small",
    2: "🚶 Take a walk in nature",
    3: "🎨 Do a creative activity",
    4: "📚 Read something inspiring",
    5: "💬 Share your progress with a friend"
  };
  const [customRewards, setCustomRewards] = useState({});
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(0);
  // Ref to track last level for celebratory alert
  const lastLevelRef = useRef(0);
  const [showBadge, setShowBadge] = useState(false);

  // Sparkle animation refs
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const sparkleTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const newLevel = Math.floor(currentXP / levelThreshold);
    setLevel(newLevel);
    setProgress(currentXP % levelThreshold);
    // Show celebratory alert if user levels up
    if (newLevel > lastLevelRef.current) {
      Alert.alert(
        "🎉 Level Up!",
        `You've reached Level ${newLevel}!\n\nReward: ${customRewards[newLevel] || presetRewards[newLevel] || '🎁 New level!'}`
      );
      setShowBadge(true);
      // Sparkle animation
      sparkleOpacity.setValue(1);
      sparkleTranslate.setValue(0);
      Animated.parallel([
        Animated.timing(sparkleTranslate, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ]).start();
      setTimeout(() => setShowBadge(false), 3000); // Hide after 3 seconds
      lastLevelRef.current = newLevel;
    }
  }, [currentXP]);

  // Load custom rewards on mount
  useEffect(() => {
    const loadCustomRewards = async () => {
      try {
        const saved = await AsyncStorage.getItem('customRewards');
        if (saved) {
          setCustomRewards(JSON.parse(saved));
        }
        const user = getAuth().currentUser;
        if (user) {
          const db = getFirestore();
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().customRewards) {
            setCustomRewards(prev => ({ ...prev, ...docSnap.data().customRewards }));
          }
        }
      } catch (err) {
        console.warn('⚠️ Error loading custom rewards:', err);
      }
    };
    loadCustomRewards();
  }, []);

  const handleSaveReward = async () => {
    setSavedReward(reward);
    const lvl = parseInt(targetLevel);
    const updatedRewards = {
      ...customRewards,
      [lvl]: reward
    };
    setCustomRewards(updatedRewards);
    try {
      await AsyncStorage.setItem('customRewards', JSON.stringify(updatedRewards));
      const user = getAuth().currentUser;
      if (user) {
        const db = getFirestore();
        await setDoc(doc(db, 'users', user.uid), { customRewards: updatedRewards }, { merge: true });
      }
    } catch (err) {
      console.warn('⚠️ Error saving custom rewards:', err);
    }
    Alert.alert('Reward saved', `Your reward: ${reward}`);
  };

  // Handler to delete a planned reward
  const handleDeleteReward = async (levelKey) => {
    const updated = { ...customRewards };
    delete updated[levelKey];
    setCustomRewards(updated);
    try {
      await AsyncStorage.setItem('customRewards', JSON.stringify(updated));
      const user = getAuth().currentUser;
      if (user) {
        const db = getFirestore();
        await setDoc(doc(db, 'users', user.uid), { customRewards: updated }, { merge: true });
      }
    } catch (err) {
      console.warn('⚠️ Error deleting reward:', err);
    }
  };

  return (
    <>
      {(typeof isPremium === 'undefined' || typeof currentXP !== 'number') && (
        <SafeAreaView style={styles.container}>
          <Text>Loading...</Text>
        </SafeAreaView>
      )}

      {(!isPremium && typeof currentXP !== 'number') && (
        <SafeAreaView style={styles.container}>
          <Text>⏳ Waiting on XP context or premium status...</Text>
        </SafeAreaView>
      )}

      {isPremium && typeof currentXP === 'number' && (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>XP Status</Text>
            <Text style={styles.status}>Current XP: {currentXP}</Text>
            <Text style={styles.status}>Level: {level}</Text>
            <Text style={styles.status}>Progress to next level: {progress} / {levelThreshold}</Text>
            {/* Sparkle animation on level up */}
            <Animated.Text
              style={{
                fontSize: 32,
                position: 'absolute',
                top: 100,
                alignSelf: 'center',
                opacity: sparkleOpacity,
                transform: [{ translateY: sparkleTranslate }]
              }}
            >
              ✨
            </Animated.Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(progress / levelThreshold) * 100}%` }]} />
            </View>
            {showBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🏅 Level {level}</Text>
              </View>
            )}

            <Text style={styles.subheader}>Set Reward for Specific Level</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter level number..."
              keyboardType="numeric"
              value={targetLevel}
              onChangeText={setTargetLevel}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your reward..."
              value={reward}
              onChangeText={setReward}
            />
            <Button title="Save Reward" onPress={handleSaveReward} />
            <Text style={styles.savedReward}>
              Reward for Level {targetLevel}:{' '}
              {customRewards[parseInt(targetLevel)] || presetRewards[parseInt(targetLevel)] || '🎁 New level!'}
            </Text>

            <Text style={styles.subheader}>🎯 All Planned Rewards</Text>
            {Object.keys(customRewards)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(levelKey => (
                <View key={levelKey} style={styles.plannedRewardRow}>
                  <Text style={styles.plannedReward}>
                    Level {levelKey}: {customRewards[levelKey]}
                  </Text>
                  <Button title="Delete" onPress={() => handleDeleteReward(levelKey)} />
                </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      )}

      {!isPremium && typeof currentXP === 'number' && (
        <SafeAreaView style={styles.container}>
          <Text style={styles.header}>
            Upgrade to Premium to access XP tracking and rewards!
          </Text>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    marginTop: 20,
    marginLeft: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  status: {
    fontSize: 18,
    marginVertical: 5
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50'
  },
  subheader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#444'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginVertical: 8
  },
  savedReward: {
    fontSize: 16,
    marginTop: 10,
    fontStyle: 'italic'
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#ffd700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5
  },
  badgeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  plannedReward: {
    fontSize: 16,
    marginTop: 4,
    paddingLeft: 10
  },
  plannedRewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 6,
    borderRadius: 6
  }
});

export default XPStatusScreen;