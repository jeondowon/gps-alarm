import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, Star, Music, Settings, MapPin, Home, Briefcase, GraduationCap, Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, darkMapStyle } from '@/constants/Colors';
import { Favorite, FavoriteIcon, FAVORITES_STORAGE_KEY } from '@/types/favorites';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

function getFavIcon(type: FavoriteIcon) {
  const map = { home: Home, work: Briefcase, school: GraduationCap, heart: Heart, star: Star, pin: MapPin };
  return map[type] ?? MapPin;
}

interface Prediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY).then(raw => {
      setFavorites(raw ? JSON.parse(raw) : []);
    });
  }, []));

  useEffect(() => {
    if (!query.trim()) { setPredictions([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${API_KEY}&language=ko`
        );
        const json = await res.json();
        if (json.predictions) {
          setPredictions(json.predictions.map((p: any) => ({
            placeId: p.place_id,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text || '',
            fullText: p.description,
          })));
        }
      } catch { setPredictions([]); }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const navigateToRadius = async (placeId: string, name: string, address: string) => {
    setQuery('');
    setPredictions([]);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}&fields=geometry`
      );
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      if (loc) router.push({ pathname: '/radius', params: { lat: loc.lat, lng: loc.lng, name, address } });
    } catch {}
  };

  const handleMapPress = async (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}&language=ko`
      );
      const json = await res.json();
      const address = json.results?.[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      router.push({ pathname: '/radius', params: { lat, lng, name: 'Selected Location', address } });
    } catch {
      router.push({ pathname: '/radius', params: { lat, lng, name: 'Selected Location', address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` } });
    }
  };

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        customMapStyle={darkMapStyle}
        initialRegion={{ latitude: 37.5665, longitude: 126.978, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        onPress={handleMapPress}
      />

      {/* Search bar */}
      <View style={[styles.searchContainer, { top: insets.top + 16 }]}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.gray400} strokeWidth={1.5} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor={Colors.gray400}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        {predictions.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.predictionItem}
                  onPress={() => navigateToRadius(item.placeId, item.mainText, item.secondaryText)}
                >
                  <MapPin size={16} color={Colors.crimsonRed} strokeWidth={1.5} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.predictionMain}>{item.mainText}</Text>
                    <Text style={styles.predictionSub} numberOfLines={1}>{item.secondaryText}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Quick access buttons */}
      <View style={[styles.quickButtons, { top: insets.top + 80 }]}>
        {[
          { Icon: Star, route: '/favorites' },
          { Icon: Music, route: '/sound-haptic' },
          { Icon: Settings, route: '/settings' },
        ].map(({ Icon, route }) => (
          <TouchableOpacity key={route} style={styles.quickBtn} onPress={() => router.push(route as any)}>
            <Icon size={20} color={Colors.white} strokeWidth={1.5} />
          </TouchableOpacity>
        ))}
        {/* DEV ONLY */}
        <TouchableOpacity
          style={[styles.quickBtn, { borderColor: Colors.crimsonRed }]}
          onPress={async () => {
            await AsyncStorage.setItem('alarmData', JSON.stringify({
              destination: '강남역', address: '서울 강남구 강남대로 396', lat: 37.4979, lng: 127.0276, radius: 0.5,
            }));
            router.push('/trigger');
          }}
        >
          <Text style={{ color: Colors.crimsonRed, fontSize: 10, fontWeight: '700' }}>TEST</Text>
        </TouchableOpacity>
      </View>

      {/* Favorites bar */}
      <View style={[styles.favBar, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.favLabel}>Favorites</Text>
        {favorites.length === 0 ? (
          <TouchableOpacity style={styles.favEmpty} onPress={() => router.push('/favorites')}>
            <Star size={16} color={Colors.gray600} strokeWidth={1.5} />
            <Text style={styles.favEmptyText}>Add favorite places</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            horizontal
            data={favorites}
            keyExtractor={f => f.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => {
              const Icon = getFavIcon(item.icon);
              return (
                <TouchableOpacity
                  style={styles.favCard}
                  onPress={() => router.push({ pathname: '/radius', params: { lat: item.lat, lng: item.lng, name: item.name, address: item.address } })}
                >
                  <Icon size={24} color={Colors.white} strokeWidth={1.5} />
                  <Text style={styles.favCardName}>{item.name}</Text>
                  <Text style={styles.favCardAddr} numberOfLines={1}>{item.address}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  searchContainer: { position: 'absolute', left: 16, right: 16, zIndex: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, paddingHorizontal: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 14, color: Colors.white, fontSize: 15, fontWeight: '300' },
  dropdown: { backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, marginTop: 4, maxHeight: 300 },
  predictionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  predictionMain: { fontSize: 14, color: Colors.white, fontWeight: '500' },
  predictionSub: { fontSize: 12, color: Colors.gray400, fontWeight: '300', marginTop: 2 },
  quickButtons: { position: 'absolute', right: 16, gap: 12, zIndex: 20 },
  quickBtn: { width: 48, height: 48, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  favBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.black, borderTopWidth: 1, borderTopColor: Colors.gray800, paddingTop: 16, paddingHorizontal: 16 },
  favLabel: { fontSize: 11, color: Colors.gray400, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  favCard: { width: 128, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, padding: 16, borderRadius: 4 },
  favCardName: { fontSize: 14, color: Colors.white, fontWeight: '500', marginTop: 12 },
  favCardAddr: { fontSize: 12, color: Colors.gray400, fontWeight: '300', marginTop: 4 },
  favEmpty: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  favEmptyText: { fontSize: 13, color: Colors.gray600, fontWeight: '300' },
});
