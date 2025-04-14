import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
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

  const fadeAnim = useState(new Animated.Value(1))[0]; // opacity starts at 1

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
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (err) {
        console.warn('⚠️ Error unloading sound on restart:', err);
      }
    }
  
    // ✨ Animate fade-out
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  
    setIsPlaying(false);
    setCurrentStep(0);
  
    // slight delay before restarting audio
    setTimeout(() => playStepAudio(0), 50);
  };

  const handleProceed = () => {
    navigation.navigate('MainTabs', { screen: 'Categories' });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.header} allowFontScaling={true}>Guided Meditation</Text>
  
      {/* Cancel and Skip Buttons */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}>
        <Text style={styles.skipText}>Cancel</Text>
      </TouchableOpacity>
  
      <TouchableOpacity
  style={styles.skipButton}
  onPress={async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (err) {
        console.warn('⚠️ Failed to stop sound:', err);
      }
    }
    navigation.navigate('MainTabs', { screen: 'Categories' });
  }}
>
  <Text style={styles.skipText}>Skip</Text>
</TouchableOpacity>
  
      {/* Meditation Prompt */}
      <Text style={styles.prompt} allowFontScaling={true}>
        {meditationSteps[currentStep].prompt}
      </Text>
  
      {/* Controls: Pause + Restart */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={async () => {
          if (sound && isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
          }
        }}>
          <Text style={styles.buttonText} allowFontScaling={true}>Pause</Text>
        </TouchableOpacity>
  
        <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
          <Text style={styles.buttonText} allowFontScaling={true}>Restart</Text>
        </TouchableOpacity>
      </View>
  
      {/* Final Button when Meditation Ends */}
      {currentStep === meditationSteps.length - 1 && !isPlaying && (
        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText} allowFontScaling={true}>Set Your Goals</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
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
  cancelButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'transparent',
    padding: 10,
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'transparent',
    padding: 10,
  },
  skipText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default GuidedMeditationScreen;