import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, ChevronRight, Shield, FileText, Info, Headphones, LogOut, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const SUPPORT = [
  { label: 'Customer Support', Icon: Headphones },
  { label: 'App Information', Icon: Info },
  { label: 'Privacy Policy', Icon: Shield },
  { label: 'Terms of Service', Icon: FileText },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userLoggedIn');
    router.replace('/onboarding');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); router.replace('/onboarding'); } },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} strokeWidth={1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Support */}
        <Text style={styles.groupLabel}>Support & Resources</Text>
        <View style={styles.group}>
          {SUPPORT.map(({ label, Icon }, i) => (
            <View key={label}>
              <TouchableOpacity style={styles.row}>
                <Icon size={20} color={Colors.white} strokeWidth={1} />
                <Text style={styles.rowLabel}>{label}</Text>
                <ChevronRight size={20} color={Colors.gray400} strokeWidth={1} />
              </TouchableOpacity>
              {i < SUPPORT.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>

        {/* Account */}
        <Text style={styles.groupLabel}>Account</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <LogOut size={20} color={Colors.white} strokeWidth={1} />
            <Text style={styles.rowLabel}>Log Out</Text>
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} onPress={handleDelete}>
            <Trash2 size={20} color={Colors.crimsonRed} strokeWidth={1} />
            <Text style={[styles.rowLabel, { color: Colors.crimsonRed }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0{'\n'}© 2026 Next Stop</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  headerTitle: { fontSize: 16, color: Colors.white, fontWeight: '500' },
  scroll: { padding: 16, paddingBottom: 48 },
  groupLabel: { fontSize: 11, color: Colors.gray400, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 24, paddingHorizontal: 4 },
  group: { backgroundColor: Colors.gray900, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: Colors.gray800 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  rowLabel: { flex: 1, fontSize: 16, color: Colors.white, fontWeight: '300' },
  rowDivider: { height: 1, backgroundColor: Colors.gray800, marginLeft: 48 },
  version: { textAlign: 'center', fontSize: 12, color: Colors.gray400, fontWeight: '300', marginTop: 48, lineHeight: 20 },
});
