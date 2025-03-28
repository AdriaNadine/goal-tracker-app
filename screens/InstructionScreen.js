import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InstructionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header} allowFontScaling={true}>Welcome to Goal Tracker</Text>
      <Text style={styles.instructionText} allowFontScaling={true}>
        This app helps you set and achieve your goals by breaking them into manageable steps. Follow these simple steps:
      </Text>
      <Text style={styles.stepText} allowFontScaling={true}>1. Sign in or create an account.</Text>
      <Text style={styles.stepText} allowFontScaling={true}>2. Create categories for different areas of your life.</Text>
      <Text style={styles.stepText} allowFontScaling={true}>3. Define your goals with detailed questions.</Text>
      <Text style={styles.stepText} allowFontScaling={true}>4. Break goals into steps and track your progress.</Text>
      <Text style={styles.instructionText} allowFontScaling={true}>
        Ready to get started? Click below to sign in or sign up!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AuthGate')}
      >
        <Text style={styles.buttonText} allowFontScaling={true}>Proceed to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  stepText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InstructionScreen;