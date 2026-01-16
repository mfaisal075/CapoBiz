import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';

// --- Theme Constants (Green Palette - Preserved) ---
const COLORS = {
  primary: '#57B959', // Deep Forest Green
  primaryDark: '#2A652B',
  gradientTop: '#2A652B',
  gradientBottom: '#2A652B',
  white: '#FFFFFF',
  textLight: 'rgba(255, 255, 255, 0.8)',
};

const SplashScreen = () => {
  const navigation = useNavigation();

  // --- Animation Values ---
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;

  // Ripple Animation
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;

  // Background floating animations (Circles from user snippet)
  const circle1Y = useRef(new Animated.Value(0)).current;
  const circle2Y = useRef(new Animated.Value(0)).current;

  // Loading Dots
  const dot1Op = useRef(new Animated.Value(0.3)).current;
  const dot2Op = useRef(new Animated.Value(0.3)).current;
  const dot3Op = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 1. Entrance Sequence
    Animated.sequence([
      // Logo Entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 10,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Text Entrance (Optional, keeping values in case used later)
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 8,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Ripple Loop (Pulse behind logo)
    Animated.loop(
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 1.5,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 3. Background Floating Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1Y, {
          toValue: -20,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle1Y, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2Y, {
          toValue: 20,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle2Y, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 4. Loading Dots Loop
    const dotAnim = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    dotAnim(dot1Op, 0);
    dotAnim(dot2Op, 200);
    dotAnim(dot3Op, 400);

    // 5. Navigation Timer
    const timer = setTimeout(() => {
      // @ts-ignore
      navigation.replace('Login');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={[COLORS.gradientTop, COLORS.gradientBottom]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        {/* --- Background Decor (Circles from user snippet) --- */}
        <Animated.View
          style={[styles.bgCircle1, {transform: [{translateY: circle1Y}]}]}
        />
        <Animated.View
          style={[styles.bgCircle2, {transform: [{translateY: circle2Y}]}]}
        />

        {/* --- Main Content --- */}
        <View style={styles.centerContainer}>
          <View style={styles.logoContainer}>
            {/* Ripple Effect */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  transform: [{scale: rippleScale}],
                  opacity: rippleOpacity,
                },
              ]}
            />
            {/* Logo Wrapper */}
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  opacity: logoOpacity,
                  transform: [{scale: logoScale}],
                },
              ]}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* --- Footer (Loading + Version) --- */}
        <View style={styles.footerContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, {opacity: dot1Op}]} />
            <Animated.View style={[styles.dot, {opacity: dot2Op}]} />
            <Animated.View style={[styles.dot, {opacity: dot3Op}]} />
          </View>

          <Text style={styles.versionText}>Version 0.1.6</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Background Decor (Circles)
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: wp('60%'),
    height: wp('60%'),
    borderRadius: wp('30%'),
    backgroundColor: 'rgba(255,255,255,0.05)', // Subtle white on green
  },
  bgCircle2: {
    position: 'absolute',
    bottom: hp('10%'),
    left: -50,
    width: wp('40%'),
    height: wp('40%'),
    borderRadius: wp('20%'),
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // Center Content
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    width: wp('45%'),
    height: wp('45%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('3%'),
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: wp('22.5%'),
    backgroundColor: 'rgba(255,255,255,0.1)', // Lighter ripple
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoWrapper: {
    width: '85%',
    height: '85%',
    backgroundColor: 'transparent',
    borderRadius: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '200%',
    height: '200%',
    tintColor: COLORS.white,
  },

  // Footer
  footerContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
