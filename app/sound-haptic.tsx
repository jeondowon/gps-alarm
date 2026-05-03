import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, PanResponder } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Play, Circle, Plus, Speaker, Headphones, Smartphone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const SOUNDS = [
  { id: 1, name: 'Midnight Echo', duration: '0:04' },
  { id: 2, name: 'Pulse', duration: '0:03' },
  { id: 3, name: 'Rapid Red', duration: '0:02' },
  { id: 4, name: 'Silent Dawn', duration: '0:05' },
  { id: 5, name: 'Harmonic Alert', duration: '0:03' },
];

type Mode = 'speaker' | 'earphones' | 'vibrate';
export const SOUND_SETTINGS_KEY = 'sound_settings';

function SimpleSlider({ value, onValueChange, color }: { value: number; onValueChange: (v: number) => void; color: string }) {
  const trackWidth = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        const clamped = Math.max(0, Math.min(1, x / trackWidth.current));
        onValueChange(clamped);
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        const clamped = Math.max(0, Math.min(1, x / trackWidth.current));
        onValueChange(clamped);
      },
    })
  ).current;

  return (
    <View
      style={sliderStyles.track}
      onLayout={e => { trackWidth.current = e.nativeEvent.layout.width; }}
      {...panResponder.panHandlers}
    >
      <View style={[sliderStyles.fill, { width: `${value * 100}%` as any, backgroundColor: color }]} />
      <View style={[sliderStyles.thumb, { left: `${value * 100}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: { height: 40, justifyContent: 'center', position: 'relative' },
  fill: { height: 3, borderRadius: 2, backgroundColor: Colors.crimsonRed },
  thumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, marginLeft: -9, top: '50%', marginTop: -9 },
});

export default function SoundHapticScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedSound, setSelectedSound] = useState(2);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [haptic, setHaptic] = useState(0.7);
  const [mode, setMode] = useState<Mode>('speaker');

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(SOUND_SETTINGS_KEY).then(raw => {
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.mode) setMode(s.mode);
      if (s.selectedSound) setSelectedSound(s.selectedSound);
      if (s.volume != null) setVolume(s.volume);
      if (s.haptic != null) setHaptic(s.haptic);
    });
  }, []));

  const save = (patch: object) => {
    AsyncStorage.getItem(SOUND_SETTINGS_KEY).then(raw => {
      const current = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
    });
  };

  const handlePlay = (id: number) => {
    setPlayingId(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setPlayingId(null), 1500);
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    save({ mode: m });
  };

  const handleSoundSelect = (id: number) => {
    setSelectedSound(id);
    save({ selectedSound: id });
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    save({ volume: v });
  };

  const handleHapticChange = (v: number) => {
    setHaptic(v);
    save({ haptic: v });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const MODES: { key: Mode; Icon: typeof Speaker; label: string }[] = [
    { key: 'speaker', Icon: Speaker, label: 'Speaker' },
    { key: 'earphones', Icon: Headphones, label: 'Earphones' },
    { key: 'vibrate', Icon: Smartphone, label: 'Vibrate' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.white} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOUND & HAPTICS</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Waveform */}
      <View style={styles.waveform}>
        {[3,7,12,18,24,28,32,28,24,18,15,20,26,22,16,12,8,4,6,10,14,18,22,18,14,10,6].map((h, i) => (
          <View key={i} style={{ width: 4, height: playingId ? h : h * 0.3, backgroundColor: playingId ? Colors.crimsonRed : Colors.white, opacity: playingId ? 1 : 0.3, borderRadius: 2 }} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Alarm tones */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alarm Tones</Text>
          <View style={styles.sectionLine} />
        </View>

        {SOUNDS.map((sound) => (
          <View key={sound.id} style={[styles.soundCard, selectedSound === sound.id && styles.soundCardActive]}>
            <TouchableOpacity style={styles.soundRow} onPress={() => handleSoundSelect(sound.id)}>
              <Circle size={20} color={selectedSound === sound.id ? Colors.crimsonRed : Colors.gray700} fill={selectedSound === sound.id ? Colors.crimsonRed : 'transparent'} strokeWidth={1.5} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.soundName, selectedSound === sound.id && { color: Colors.white }]}>{sound.name}</Text>
                <Text style={styles.soundDuration}>{sound.duration}</Text>
              </View>
              <TouchableOpacity style={styles.playBtn} onPress={() => handlePlay(sound.id)}>
                <Play size={20} color={Colors.white} fill={playingId === sound.id ? Colors.white : 'transparent'} strokeWidth={2} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color={Colors.gray300} strokeWidth={1.5} />
          <Text style={styles.addText}>Add Custom Song</Text>
        </TouchableOpacity>

        {/* Alarm mode */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Alarm Mode</Text>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.modeRow}>
          {MODES.map(({ key, Icon, label }) => (
            <TouchableOpacity key={key} style={[styles.modeBtn, mode === key && styles.modeBtnActive]} onPress={() => handleModeChange(key)}>
              <Icon size={24} color={mode === key ? Colors.crimsonRed : Colors.gray300} strokeWidth={1.5} />
              <Text style={[styles.modeLabel, mode === key && { color: Colors.white }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Volume */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Volume</Text>
          <View style={styles.sectionLine} />
          <Text style={styles.sliderValue}>{Math.round(volume * 100)}%</Text>
        </View>
        <SimpleSlider value={volume} onValueChange={handleVolumeChange} color={Colors.crimsonRed} />

        {/* Haptic */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Vibration</Text>
          <View style={styles.sectionLine} />
          <Text style={styles.sliderValue}>{Math.round(haptic * 100)}%</Text>
        </View>
        <SimpleSlider value={haptic} onValueChange={handleHapticChange} color={Colors.crimsonRed} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray800 },
  headerTitle: { fontSize: 13, color: Colors.gray300, fontWeight: '300', letterSpacing: 2 },
  waveform: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 80, gap: 3, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: Colors.gray800, paddingVertical: 16 },
  scroll: { padding: 24, paddingBottom: 48 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 11, color: Colors.gray300, fontWeight: '300', letterSpacing: 2, textTransform: 'uppercase' },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.gray800 },
  sliderValue: { fontSize: 11, color: Colors.white, fontWeight: '500' },
  soundCard: { backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  soundCardActive: { borderColor: Colors.crimsonRed },
  soundRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  soundName: { fontSize: 15, color: Colors.gray200, fontWeight: '500' },
  soundDuration: { fontSize: 13, color: Colors.gray300, fontWeight: '300', marginTop: 2 },
  playBtn: { width: 40, height: 40, backgroundColor: Colors.crimsonRed, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, padding: 16 },
  addText: { fontSize: 14, color: Colors.gray300, fontWeight: '300' },
  modeRow: { flexDirection: 'row', gap: 12 },
  modeBtn: { flex: 1, backgroundColor: Colors.gray900, borderWidth: 1, borderColor: Colors.gray800, borderRadius: 4, padding: 16, alignItems: 'center', gap: 8 },
  modeBtnActive: { borderColor: Colors.crimsonRed },
  modeLabel: { fontSize: 12, color: Colors.gray300, fontWeight: '300' },
});
