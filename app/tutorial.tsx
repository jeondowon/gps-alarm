import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, Navigation, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const STEPS = [
  { Icon: Search, title: 'Find Your Stop', description: 'Search for your destination or tap anywhere on the map to set a target.' },
  { Icon: Navigation, title: 'Set Your Radius', description: 'Choose when to be alerted—300m, 500m, 1km, or 2km from your stop.' },
  { Icon: Bell, title: 'Rest Easy', description: "We'll track your location in the background and wake you up when you're close." },
];

export default function TutorialScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const transition = (nextStep: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      transition(step + 1);
    } else {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      router.push('/login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    router.push('/login');
  };

  const { Icon, title, description } = STEPS[step];

  return (
    <View style={styles.container}>
      {step < STEPS.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconCircle}>
          <Icon size={56} color={Colors.crimsonRed} strokeWidth={1} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
        <Text style={styles.primaryBtnText}>{step === STEPS.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 48 },
  skipBtn: { position: 'absolute', top: 60, right: 24 },
  skipText: { fontSize: 13, color: Colors.gray600, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase' },
  content: { alignItems: 'center', marginBottom: 48 },
  iconCircle: { width: 128, height: 128, borderRadius: 64, borderWidth: 1, borderColor: Colors.gray200, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black, textAlign: 'center', letterSpacing: -0.5, marginBottom: 16 },
  description: { fontSize: 16, color: Colors.gray600, textAlign: 'center', fontWeight: '300', lineHeight: 24, paddingHorizontal: 16 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 48 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gray200 },
  dotActive: { width: 32, backgroundColor: Colors.crimsonRed },
  primaryBtn: { width: '100%', maxWidth: 360, backgroundColor: Colors.crimsonRed, paddingVertical: 22, alignItems: 'center', borderRadius: 4 },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
});
