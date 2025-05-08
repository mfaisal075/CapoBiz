import { StyleSheet, Text, View, ImageBackground, SafeAreaView,  } from 'react-native';
import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Login' as never);  
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../assets/screen.jpg')}
        resizeMode='cover'
        style={styles.background}
      >
        <View style={styles.content}>
          <Animatable.Image 
            animation="bounceIn"
            duration={2000}
            delay={500}
            style={styles.logo}
            source={require('../assets/icon.png')}
          />
        </View>

        <Animatable.View 
          animation="fadeInUp"
          duration={1500}
          delay={2000}
          style={styles.footer}
        >
          <Text style={styles.text}>
            Version 1.0
          </Text>
        </Animatable.View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  background: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  content: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { 
    width: 150,
    height: 180,
    tintColor:'white'
  },
  footer: {
    paddingBottom: 30,
  },
  text: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14,
  },
});
