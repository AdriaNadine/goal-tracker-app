import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text } from 'react-native';
import { View, Text as RNText, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getAuth, signOut } from 'firebase/auth';
import { getAuth as getAuthFirestore } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useXP } from '../context/XPContext';

const SettingsScreen = ({ navigation }) => {
  const navigationHook = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      Alert.alert("Signed out", "You've been logged out.");
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const handleResetProgress = async () => {
    Alert.alert(
      "Reset All Progress?",
      "This will delete your local goals, steps, XP and reflections. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset", style: "destructive", onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Progress Reset", "All local data cleared.");
            } catch (e) {
              Alert.alert("Error", "Failed to clear local data.");
            }
          }
        }
      ]
    );
  };

  const handleSetReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌟 Daily Motivation",
        body: "Check in and make progress on your goals today!",
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
    Alert.alert("Reminder Set", "Daily reminder scheduled for 9:00 AM.");
  };

  const { currentXP, level } = useXP();

  const handleManualFullSync = async () => {
    try {
      const db = getFirestore();
      const user = getAuth().currentUser;
      if (!user) return;

      // Sync XP & level
      await setDoc(doc(db, 'users', user.uid), {
        xp: currentXP,
        level: level
      }, { merge: true });

      // Sync goals
      const goals = await AsyncStorage.getItem('goals');
      if (goals) {
        for (const goal of JSON.parse(goals)) {
          await setDoc(doc(db, 'goals', goal.id), goal, { merge: true });
        }
      }

      // Sync steps
      const steps = await AsyncStorage.getItem('steps');
      if (steps) {
        for (const step of JSON.parse(steps)) {
          await setDoc(doc(db, 'steps', step.id), step, { merge: true });
        }
      }

      // Sync completed goals
      const completed = await AsyncStorage.getItem('completedGoals');
      if (completed) {
        for (const goal of JSON.parse(completed)) {
          await setDoc(doc(db, 'completedGoals', goal.id), goal, { merge: true });
        }
      }

      Alert.alert("✅ Synced", "All data synced to Firestore.");
    } catch (err) {
      Alert.alert("Sync Failed", "Could not sync everything to Firestore.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingBottom: 10 }}>
        <Text style={{ fontSize: 16, color: '#007AFF' }}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>⚙️ Settings</Text>
      <Button title="💎 Premium Features" onPress={() => navigation.navigate('Premium')} />
      <View style={{ marginTop: 30 }}>
        <Button title="Set Daily Reminder" onPress={handleSetReminder} />
        <View style={{ height: 10 }} />
        <Button title="Reset All Progress" color="#cc0000" onPress={handleResetProgress} />
        <View style={{ height: 10 }} />
        <Button title="Logout" onPress={handleLogout} />
        <View style={{ height: 10 }} />
        <Button title="Backup All Data" onPress={handleManualFullSync} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    marginTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  }
});

export default SettingsScreen;
