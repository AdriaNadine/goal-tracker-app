import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView } from 'react-native';
import xpModule from '../utils/xp';

const levelThreshold = 100;

const XPStatusScreen = () => {
  const [currentXP, setCurrentXP] = useState(0);
  const [reward, setReward] = useState('');
  const [savedReward, setSavedReward] = useState('');
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(0);

  // Dummy function to simulate awarding XP
  const awardDummyXP = async () => {
    const newXP = await xpModule.awardXP(10);
    setCurrentXP(newXP);
  };

  useEffect(() => {
    setLevel(Math.floor(currentXP / levelThreshold));
    setProgress(currentXP % levelThreshold);
  }, [currentXP]);

  // Save reward function: update the savedReward state
  const handleSaveReward = () => {
    setSavedReward(reward);
    // Ideally, persist this reward in storage or backend if needed
    Alert.alert('Reward saved', `Your reward: ${reward}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>XP Status</Text>
      <Text style={styles.status}>Current XP: {currentXP}</Text>
      <Text style={styles.status}>Level: {level}</Text>
      <Text style={styles.status}>Progress to next level: {progress} / {levelThreshold}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(progress / levelThreshold) * 100}%` }]} />
      </View>
      <Button title="Award 10 XP" onPress={awardDummyXP} />
      
      <Text style={styles.subheader}>Set Your Reward</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your reward..."
        value={reward}
        onChangeText={setReward}
      />
      <Button title="Save Reward" onPress={handleSaveReward} />
      {savedReward ? <Text style={styles.savedReward}>Your reward: {savedReward}</Text> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#fff'
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
    marginTop: 30
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10
  },
  savedReward: {
    fontSize: 16,
    marginTop: 10,
    fontStyle: 'italic'
  }
});

export default XPStatusScreen;
