import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('../assets/splash.png')}
      style={styles.container}
      resizeMode="contain"
    >
      <View style={styles.overlay}>
        <View style={styles.quoteContainer}>
          <Text style={styles.quote} allowFontScaling={true}>“Start where you are.</Text>
          <Text style={styles.quote} allowFontScaling={true}>Use what you have.</Text>
          <Text style={styles.quote} allowFontScaling={true}>Do what you can.”</Text>
        </View>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Instruction')}
        >
          <Text style={styles.buttonText} allowFontScaling={true}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 350,
  },
  quoteContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  quote: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 40,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;