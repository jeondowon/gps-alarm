import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Home, Briefcase, GraduationCap, Heart, Star, MapPin, Edit2, Trash2, Plus, Search, X, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Favorite, FavoriteIcon, FAVORITES_STORAGE_KEY } from '@/types/favorites';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

const ICON_OPTIONS: { type: FavoriteIcon; Icon: any }[] = [
  { type: 'home', Icon: Home },
  { type: 'work', Icon: Briefcase },
  { type: 'school', Icon: GraduationCap },
  { type: 'heart', Icon: Heart },
  { type: 'star', Icon: Star },
  { type: 'pin', Icon: MapPin },
];

function getIconComponent(type: FavoriteIcon) {
  return ICON_OPTIONS.find(i => i.type === type)?.Icon ?? MapPin;
}

interface Prediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Favorite | null>(null);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState<FavoriteIcon>('home');
  const [formLocation, setFormLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  useFocusEffect(useCallback(() => {
    loadFavorites();
  }, []));

  const loadFavorites = async () => {
    const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    setFavorites(raw ? JSON.parse(raw) : []);
  };

  const persist = async (items: Favorite[]) => {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    setFavorites(items);
  };

  const openAdd = () => {
    setEditTarget(null);
    setFormName('');
    setFormIcon('home');
    setFormLocation(null);
    setSearchQuery('');
    setPredictions([]);
    setModalVisible(true);
  };

  const openEdit = (item: Favorite) => {
    setEditTarget(item);
    setFormName(item.name);
    setFormIcon(item.icon);
    setFormLocation({ address: item.address, lat: item.lat, lng: item.lng });
    setSearchQuery('');
    setPredictions([]);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formLocation) return;
    const item: Favorite = {
      id: editTarget?.id ?? String(Date.now()),
      name: formName.trim(),
      icon: formIcon,
      address: formLocation.address,
      lat: formLocation.lat,
      lng: formLocation.lng,
    };
    const updated = editTarget
      ? favorites.map(f => f.id === editTarget.id ? item : f)
      : [...favorites, item];
    await persist(updated);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this place?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => persist(favorites.filter(f => f.id !== id)) },
    ]);
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setPredictions([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${API_KEY}&language=ko`
        );
        const json = await res.json();
        if (json.predictions) {
          setPredictions(json.predictions.map((p: any) => ({
            placeId: p.place_id,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text || '',
          })));
        }
      } catch { setPredictions([]); }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const selectPlace = async (placeId: string, mainText: string, secondaryText: string) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}&fields=geometry,formatted_address`
      );
      const json = await res.json();
      const loc = json.result?.geometry?.location;
      const addr = json.result?.formatted_address || secondaryText || mainText;
      if (loc) {
        setFormLocation({ address: addr, lat: loc.lat, lng: loc.lng });
        setSearchQuery('');
        setPredictions([]);
        if (!formName.trim()) setFormName(mainText);
      }
    } catch {}
  };

  const canSave = formName.trim().length > 0 && formLocation !== null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MANAGE FAVORITES</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MapPin size={36} color={Colors.gray700} strokeWidth={1} />
            <Text style={styles.emptyTitle}>No saved places</Text>
            <Text style={styles.emptySub}>Tap + to add your first place</Text>
          </View>
        }
        renderItem={({ item }) => {
          const Icon = getIconComponent(item.icon);
          return (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Icon size={22} color={Colors.white} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardAddr} numberOfLines={1}>{item.address}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                <Edit2 size={18} color={Colors.gray300} strokeWidth={1.5} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Trash2 size={18} color={Colors.crimsonRed} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 24 }]} onPress={openAdd}>
        <Plus size={28} color={Colors.white} strokeWidth={2} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modal, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color={Colors.white} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editTarget ? 'EDIT PLACE' : 'ADD PLACE'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={!canSave}>
              <Check size={24} color={canSave ? Colors.crimsonRed : Colors.gray700} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>LOCATION</Text>
            {formLocation ? (
              <TouchableOpacity style={styles.selectedLocation} onPress={() => setFormLocation(null)}>
                <MapPin size={16} color={Colors.crimsonRed} strokeWidth={1.5} />
                <Text style={styles.selectedLocationText} numberOfLines={2}>{formLocation.address}</Text>
                <X size={16} color={Colors.gray400} strokeWidth={1.5} />
              </TouchableOpacity>
            ) : (
              <View>
                <View style={styles.searchBar}>
                  <Search size={18} color={Colors.gray400} strokeWidth={1.5} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a place..."
                    placeholderTextColor={Colors.gray400}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                </View>
                {predictions.length > 0 && (
                  <View style={styles.dropdown}>
                    {predictions.map(p => (
                      <TouchableOpacity
                        key={p.placeId}
                        style={styles.predictionItem}
                        onPress={() => selectPlace(p.placeId, p.mainText, p.secondaryText)}
                      >
                        <MapPin size={14} color={Colors.crimsonRed} strokeWidth={1.5} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.predictionMain}>{p.mainText}</Text>
                          <Text style={styles.predictionSub} numberOfLines={1}>{p.secondaryText}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={[styles.label, { marginTop: 24 }]}>NAME</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Home, Office, Gym..."
              placeholderTextColor={Colors.gray400}
              value={formName}
              onChangeText={setFormName}
              maxLength={30}
            />

            <Text style={[styles.label, { marginTop: 24 }]}>ICON</Text>
            <View style={styles.iconRow}>
              {ICON_OPTIONS.map(({ type, Icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.iconChoice, formIcon === type && styles.iconChoiceActive]}
                  onPress={() => setFormIcon(type)}
                >
                  <Icon size={24} color={formIcon === type ? Colors.crimsonRed : Colors.gray300} strokeWidth={1.5} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  headerTitle: { fontSize: 13, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  list: { padding: 16, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, padding: 16, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 15, color: Colors.white, fontWeight: '500' },
  cardAddr: { fontSize: 13, color: Colors.gray300, fontWeight: '300', marginTop: 2 },
  actionBtn: { padding: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 16, color: Colors.gray300, fontWeight: '300' },
  emptySub: { fontSize: 13, color: Colors.gray600, fontWeight: '300' },
  fab: { position: 'absolute', right: 24, width: 56, height: 56, backgroundColor: Colors.crimsonRed, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, backgroundColor: Colors.black },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  modalTitle: { fontSize: 13, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  modalBody: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 11, color: Colors.gray400, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  selectedLocation: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.crimsonRed, borderRadius: 4, padding: 14 },
  selectedLocationText: { flex: 1, fontSize: 14, color: Colors.white, fontWeight: '300' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, paddingHorizontal: 14 },
  searchInput: { flex: 1, paddingVertical: 12, color: Colors.white, fontSize: 14, fontWeight: '300' },
  dropdown: { backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderTopWidth: 0, borderRadius: 4, marginTop: -1 },
  predictionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  predictionMain: { fontSize: 14, color: Colors.white, fontWeight: '400' },
  predictionSub: { fontSize: 12, color: Colors.gray400, fontWeight: '300', marginTop: 2 },
  nameInput: { backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, color: Colors.white, fontSize: 15, fontWeight: '300' },
  iconRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  iconChoice: { width: 52, height: 52, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray900 },
  iconChoiceActive: { borderColor: Colors.crimsonRed },
});
