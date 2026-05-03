import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async (provider: string) => {
    // TODO: implement real OAuth (expo-auth-session)
    await AsyncStorage.setItem('userLoggedIn', provider);
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <MapPin size={32} color={Colors.white} strokeWidth={2} />
      </View>

      <Text style={styles.heading}>Never Miss a Stop</Text>
      <Text style={styles.subheading}>
        Sign in to save your favorite routes, custom alarm settings, and preferences across devices.
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleLogin('apple')}>
          <Text style={styles.appleIcon}></Text>
          <Text style={styles.socialBtnText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={() => handleLogin('google')}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.socialBtnText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity onPress={() => handleLogin('guest')}>
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 48 },
  logoBox: { width: 80, height: 80, backgroundColor: Colors.crimsonRed, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 32, shadowColor: Colors.crimsonRed, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  heading: { fontSize: 28, fontWeight: '700', color: Colors.black, letterSpacing: -0.5, marginBottom: 12, textAlign: 'center' },
  subheading: { fontSize: 15, color: Colors.gray600, textAlign: 'center', fontWeight: '300', lineHeight: 22, marginBottom: 48, paddingHorizontal: 16 },
  buttons: { width: '100%', gap: 12, marginBottom: 32 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 18, borderWidth: 1, borderColor: Colors.gray200, borderRadius: 4, backgroundColor: Colors.white },
  socialBtnText: { fontSize: 15, fontWeight: '500', color: Colors.black },
  appleIcon: { fontSize: 20, marginRight: 12, color: Colors.black },
  googleG: { fontSize: 18, fontWeight: '700', marginRight: 12, color: '#4285F4' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 32, opacity: 0.4 },
  line: { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  orText: { marginHorizontal: 16, fontSize: 12, color: Colors.gray600, fontWeight: '300', letterSpacing: 3 },
  guestText: { fontSize: 14, color: Colors.gray700, fontWeight: '500', letterSpacing: 0.5 },
});
