import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { formatRadius } from '@/types/alarm';

const DISTANCE_OPTIONS = [
  { value: 0.3, label: '300m', eta: 'About 1–2 minutes before arrival' },
  { value: 0.5, label: '500m', eta: 'About 2–3 minutes before arrival' },
  { value: 1,   label: '1km',  eta: 'About 4–5 minutes before arrival' },
  { value: 2,   label: '2km',  eta: 'About 8–10 minutes before arrival' },
];

export default function RadiusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lat: string; lng: string; name: string; address: string }>();
  const lat = parseFloat(params.lat ?? '37.5665');
  const lng = parseFloat(params.lng ?? '126.978');
  const name = params.name ?? 'Selected Location';
  const address = params.address ?? '';

  const [selectedRadius, setSelectedRadius] = useState(1);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    setTimeout(() => {
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: (selectedRadius * 2 * 1.5) / 111,
        longitudeDelta: (selectedRadius * 2 * 1.5) / 111,
      }, 400);
    }, 300);
  }, [selectedRadius]);

  const handleSetAlarm = async () => {
    await AsyncStorage.setItem('alarmData', JSON.stringify({ destination: name, address, lat, lng, radius: selectedRadius }));
    router.push('/active');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SET RADIUS</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        >
          <Marker coordinate={{ latitude: lat, longitude: lng }}>
            <View style={styles.markerDot} />
          </Marker>
          <Circle
            center={{ latitude: lat, longitude: lng }}
            radius={selectedRadius * 1000}
            strokeColor={Colors.crimsonRed}
            strokeWidth={2}
            fillColor="rgba(211,47,47,0.15)"
          />
        </MapView>

        {/* Radius label overlay */}
        <View style={styles.radiusLabel} pointerEvents="none">
          <Text style={styles.radiusLabelText}>
            {selectedRadius >= 1 ? `${selectedRadius.toFixed(0)} KM RADIUS` : `${(selectedRadius * 1000).toFixed(0)} M RADIUS`}
          </Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        {/* Destination */}
        <View style={styles.destRow}>
          <View style={styles.destAccent} />
          <View>
            <Text style={styles.destLabel}>DESTINATION</Text>
            <Text style={styles.destName}>{name}</Text>
            <Text style={styles.destAddr}>{address}</Text>
          </View>
        </View>

        {/* Radius picker */}
        <Text style={styles.sectionLabel}>ALERT RADIUS</Text>
        <View style={styles.radiusGrid}>
          {DISTANCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.radiusBtn, selectedRadius === opt.value && styles.radiusBtnActive]}
              onPress={() => setSelectedRadius(opt.value)}
            >
              <Text style={[styles.radiusBtnText, selectedRadius === opt.value && styles.radiusBtnTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.etaText}>
          {DISTANCE_OPTIONS.find((o) => o.value === selectedRadius)?.eta}
        </Text>

        <TouchableOpacity style={styles.setAlarmBtn} onPress={handleSetAlarm}>
          <Text style={styles.setAlarmText}>Set Alarm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  headerTitle: { fontSize: 13, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  markerDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.crimsonRed, borderWidth: 2, borderColor: Colors.white },
  radiusLabel: { position: 'absolute', top: 16, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 1, borderColor: Colors.crimsonRed, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8 },
  radiusLabelText: { fontSize: 12, color: Colors.white, fontWeight: '300', letterSpacing: 2 },
  bottomPanel: { backgroundColor: Colors.black, borderTopWidth: 1, borderTopColor: Colors.gray800, padding: 24, gap: 20 },
  destRow: { flexDirection: 'row', gap: 12 },
  destAccent: { width: 3, backgroundColor: Colors.crimsonRed, borderRadius: 2 },
  destLabel: { fontSize: 11, color: Colors.gray300, fontWeight: '300', letterSpacing: 2, marginBottom: 4 },
  destName: { fontSize: 18, color: Colors.white, fontWeight: '400' },
  destAddr: { fontSize: 14, color: Colors.gray400, fontWeight: '300', marginTop: 2 },
  sectionLabel: { fontSize: 11, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  radiusGrid: { flexDirection: 'row', gap: 8 },
  radiusBtn: { flex: 1, paddingVertical: 16, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, alignItems: 'center' },
  radiusBtnActive: { backgroundColor: Colors.crimsonRed },
  radiusBtnText: { fontSize: 13, color: Colors.gray300, fontWeight: '700', letterSpacing: 0.5 },
  radiusBtnTextActive: { color: Colors.white },
  etaText: { fontSize: 12, color: Colors.gray300, fontWeight: '300', textAlign: 'center', letterSpacing: 0.3 },
  setAlarmBtn: { backgroundColor: Colors.crimsonRed, paddingVertical: 20, borderRadius: 4, alignItems: 'center' },
  setAlarmText: { color: Colors.white, fontSize: 14, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
});
