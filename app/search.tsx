import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, MapPin, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

const RECENT_SEARCHES = [
  { id: 1, name: 'Union Station', address: '123 Transit Blvd, Downtown' },
  { id: 2, name: 'Central Library', address: '456 Knowledge Ave, Midtown' },
  { id: 3, name: 'Tech Park Plaza', address: '789 Innovation Dr, East District' },
  { id: 4, name: 'Riverside Market', address: '321 Waterfront St, South End' },
];

interface Prediction { placeId: string; mainText: string; secondaryText: string; }

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const search = (text: string) => {
    setQuery(text);
    clearTimeout(timer.current);
    if (!text.trim()) { setPredictions([]); return; }
    timer.current = setTimeout(async () => {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${API_KEY}&language=ko`);
      const json = await res.json();
      setPredictions((json.predictions ?? []).map((p: any) => ({
        placeId: p.place_id,
        mainText: p.structured_formatting.main_text,
        secondaryText: p.structured_formatting.secondary_text || '',
      })));
    }, 300);
  };

  const goToRadius = async (placeId: string, name: string, address: string) => {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}&fields=geometry`);
    const json = await res.json();
    const loc = json.result?.geometry?.location;
    if (loc) router.push({ pathname: '/radius', params: { lat: loc.lat, lng: loc.lng, name, address } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SEARCH</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color={Colors.crimsonRed} strokeWidth={1.5} />
        <TextInput
          autoFocus
          style={styles.input}
          placeholder="Where are you heading?"
          placeholderTextColor={Colors.gray300}
          value={query}
          onChangeText={search}
        />
      </View>

      <FlatList
        data={query.trim() ? predictions : RECENT_SEARCHES}
        keyExtractor={(item) => String(item.placeId ?? item.id)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{query.trim() ? 'Search Results' : 'Recent Searches'}</Text>
            <View style={styles.sectionLine} />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
              if ('placeId' in item && query.trim()) {
                goToRadius(item.placeId, item.mainText, item.secondaryText);
              } else if ('id' in item) {
                router.push({ pathname: '/radius', params: { lat: 37.5665, lng: 126.978, name: item.name, address: item.address } });
              }
            }}
          >
            {query.trim()
              ? <MapPin size={20} color={Colors.crimsonRed} strokeWidth={1.5} />
              : <Clock size={20} color={Colors.crimsonRed} strokeWidth={1.5} />
            }
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{'mainText' in item ? item.mainText : item.name}</Text>
              <Text style={styles.resultAddr} numberOfLines={1}>{'secondaryText' in item ? item.secondaryText : item.address}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  headerTitle: { fontSize: 13, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 16, color: Colors.white, fontSize: 15, fontWeight: '300' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 11, color: Colors.gray300, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase' },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.gray800 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, padding: 16 },
  resultName: { fontSize: 15, color: Colors.white, fontWeight: '500' },
  resultAddr: { fontSize: 13, color: Colors.gray300, fontWeight: '300', marginTop: 2 },
});
