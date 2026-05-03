import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(async () => {
      const done = await AsyncStorage.getItem('onboardingComplete');
      router.replace(done ? '/home' : '/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <MapPin size={80} color={Colors.crimsonRed} strokeWidth={1} />
        </Animated.View>
        <Text style={styles.title}>Next Stop</Text>
        <View style={styles.line} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: Colors.white, fontWeight: '500', letterSpacing: 4, textTransform: 'uppercase', marginTop: 24 },
  line: { width: 48, height: 2, backgroundColor: Colors.crimsonRed, marginTop: 16, borderRadius: 1 },
});
