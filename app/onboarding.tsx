import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { MapPin, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    await Location.requestForegroundPermissionsAsync();
    await Location.requestBackgroundPermissionsAsync();
    await Notifications.requestPermissionsAsync();
    router.push('/tutorial');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={96} color={Colors.white} strokeWidth={0.5} />
        <View style={styles.bellBadge}>
          <Bell size={48} color={Colors.crimsonRed} strokeWidth={0.5} />
        </View>
      </View>

      <Text style={styles.heading}>Rest Easy,{'\n'}We'll Alert You.</Text>
      <Text style={styles.description}>
        Enable location and notifications to never miss your stop.
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleEnable}>
        <Text style={styles.primaryBtnText}>Enable Permissions</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/tutorial')}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconContainer: { marginBottom: 64, position: 'relative' },
  bellBadge: { position: 'absolute', bottom: -8, right: -8, backgroundColor: Colors.black, padding: 8 },
  heading: { fontSize: 36, color: Colors.white, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5, lineHeight: 44, marginBottom: 24 },
  description: { fontSize: 16, color: Colors.gray300, textAlign: 'center', fontWeight: '300', lineHeight: 24, letterSpacing: 0.3, maxWidth: 320, marginBottom: 64 },
  primaryBtn: { width: '100%', maxWidth: 360, backgroundColor: Colors.crimsonRed, paddingVertical: 22, alignItems: 'center', borderRadius: 4 },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
  skipText: { marginTop: 24, fontSize: 13, color: Colors.gray300, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase' },
});
