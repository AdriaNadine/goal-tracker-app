import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

const GuidedMeditationScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const meditationSteps = [
    {
      prompt: 'Take a deep breath... Inhale slowly, and exhale.',
      audio: require('../assets/audio/step1.mp3'),
    },
    {
      prompt: 'Close your eyes and imagine a place where you feel completely at peace.',
      audio: require('../assets/audio/step2.mp3'),
    },
    {
      prompt: 'Think about something you’ve always wanted to achieve. What does success look like for you?',
      audio: require('../assets/audio/step3.mp3'),
    },
    {
      prompt: 'Visualize yourself taking the first step toward that goal. How does it feel?',
      audio: require('../assets/audio/step4.mp3'),
    },
    {
      prompt: 'What obstacles might you face? Imagine yourself overcoming them with confidence.',
      audio: require('../assets/audio/step5.mp3'),
    },
    {
      prompt: 'Now, picture yourself achieving your goal. Feel the joy and pride of your success.',
      audio: require('../assets/audio/step6.mp3'),
    },
    {
      prompt: 'You’re ready! Let’s turn your vision into actionable goals.',
      audio: require('../assets/audio/step7.mp3'),
    },
  ];

  const playStepAudio = async (stepIndex) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      meditationSteps[stepIndex].audio,
      { shouldPlay: true }
    );
    setSound(newSound);
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish && !status.isLooping) {
        setIsPlaying(false);
        await newSound.unloadAsync();
        setSound(null);
        if (stepIndex < meditationSteps.length - 1) {
          setCurrentStep(stepIndex + 1);
        }
      }
    });
  };

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      playStepAudio(currentStep); // Play initial step
    };

    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentStep]); // Depend on currentStep to retrigger playback

  const handlePauseResume = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleRestart = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setCurrentStep(0);
    await playStepAudio(0); // Explicitly start step 0
  };

  const handleProceed = () => {
    navigation.navigate('Tabs', { screen: 'CategoriesTab' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header} allowFontScaling={true}>Guided Meditation</Text>
      <Text style={styles.prompt} allowFontScaling={true}>{meditationSteps[currentStep].prompt}</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handlePauseResume}>
          <Text style={styles.buttonText} allowFontScaling={true}>{isPlaying ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
          <Text style={styles.buttonText} allowFontScaling={true}>Restart</Text>
        </TouchableOpacity>
      </View>
      {currentStep === meditationSteps.length - 1 && !isPlaying && (
        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText} allowFontScaling={true}>Set Your Goals</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E6F0FA',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  prompt: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginBottom: 100,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#8E8E93',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '40%',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GuidedMeditationScreen;