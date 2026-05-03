import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, darkMapStyle } from '@/constants/Colors';
import { AlarmData, haversineDistance, formatRadius } from '@/types/alarm';
import { startLocationTracking, stopLocationTracking } from '@/tasks/locationTask';

export default function ActiveAlarmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);
  const [currentCoord, setCurrentCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('alarmData');
      if (!raw) { router.replace('/home'); return; }
      const data: AlarmData = JSON.parse(raw);
      setAlarmData(data);

      // Start background GPS task (requires "Always" permission; fails gracefully in simulator)
      try {
        await startLocationTracking();
      } catch (err) {
        console.warn('Background location not available:', err);
      }

      // Foreground location watch
      try {
        const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
        if (fgStatus !== 'granted') {
          Alert.alert('Permission Required', 'Location permission is needed.');
          return;
        }

        // One-time fix first to validate location access
        const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const initCoord = { latitude: initial.coords.latitude, longitude: initial.coords.longitude };
        setCurrentCoord(initCoord);
        setDistance(haversineDistance(initCoord.latitude, initCoord.longitude, data.lat, data.lng));

        locationSub.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 0 },
          (loc) => {
            const coord = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setCurrentCoord(coord);
            const dist = haversineDistance(coord.latitude, coord.longitude, data.lat, data.lng);
            setDistance(dist);
            if (dist <= data.radius) {
              router.replace('/trigger');
            }
          }
        );
      } catch (err) {
        console.error('Location watch failed:', err);
      }
    })();

    return () => {
      locationSub.current?.remove();
    };
  }, []);

  // Poll alarmTriggered flag (set by background task when app is backgrounded)
  useEffect(() => {
    const interval = setInterval(async () => {
      const triggered = await AsyncStorage.getItem('alarmTriggered');
      if (triggered === 'true') {
        await AsyncStorage.removeItem('alarmTriggered');
        router.replace('/trigger');
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    locationSub.current?.remove();
    await stopLocationTracking();
    await AsyncStorage.removeItem('alarmData');
    router.replace('/home');
  };

  if (!alarmData) return null;

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <View style={[styles.statusBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.statusLeft}>
          <View style={styles.pulsingDot}>
            <View style={styles.dot} />
          </View>
          <View>
            <Text style={styles.statusLabel}>VIGILANT</Text>
            <Text style={styles.statusDistance}>
              {distance !== null ? `${distance.toFixed(2)} km remaining` : 'Acquiring location...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleCancel}>
          <X size={20} color={Colors.gray300} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ latitude: alarmData.lat, longitude: alarmData.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        >
          {/* Destination */}
          <Marker coordinate={{ latitude: alarmData.lat, longitude: alarmData.lng }}>
            <View style={styles.destMarker} />
          </Marker>
          <Circle
            center={{ latitude: alarmData.lat, longitude: alarmData.lng }}
            radius={alarmData.radius * 1000}
            strokeColor={Colors.crimsonRed}
            strokeWidth={2}
            fillColor="rgba(211,47,47,0.15)"
          />

          {/* Current position */}
          {currentCoord && (
            <>
              <Marker coordinate={currentCoord}>
                <View style={styles.currentMarker} />
              </Marker>
              <Polyline
                coordinates={[currentCoord, { latitude: alarmData.lat, longitude: alarmData.lng }]}
                strokeColor={Colors.crimsonRed}
                strokeWidth={2}
                lineDashPattern={[6, 4]}
              />
            </>
          )}
        </MapView>
      </View>

      {/* Bottom panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoLabel}>DESTINATION</Text>
            <Text style={styles.infoName}>{alarmData.destination}</Text>
            <Text style={styles.infoAddr}>{alarmData.address}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.infoLabel}>ALERT RANGE</Text>
            <Text style={styles.infoName}>{formatRadius(alarmData.radius)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel Alarm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  statusBar: { backgroundColor: Colors.gray900, borderBottomWidth: 1, borderBottomColor: Colors.gray800, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pulsingDot: { position: 'relative', width: 12, height: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.crimsonRed },
  statusLabel: { fontSize: 11, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  statusDistance: { fontSize: 14, color: Colors.white, fontWeight: '400', marginTop: 2 },
  destMarker: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.crimsonRed, borderWidth: 2, borderColor: Colors.white },
  currentMarker: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: Colors.white },
  bottomPanel: { backgroundColor: Colors.black, borderTopWidth: 1, borderTopColor: Colors.gray800, padding: 24, gap: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 11, color: Colors.gray300, fontWeight: '300', letterSpacing: 2, marginBottom: 6 },
  infoName: { fontSize: 20, color: Colors.white, fontWeight: '400' },
  infoAddr: { fontSize: 13, color: Colors.gray400, fontWeight: '300', marginTop: 4 },
  cancelBtn: { borderWidth: 1, borderColor: Colors.gray800, paddingVertical: 18, borderRadius: 4, alignItems: 'center' },
  cancelBtnText: { color: Colors.white, fontSize: 13, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase' },
});
