import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { Power, Headphones, Vibrate, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { AlarmData, formatRadius } from "@/types/alarm";
import { stopLocationTracking } from "@/tasks/locationTask";
import { SOUND_SETTINGS_KEY } from "./sound-haptic";

type AlarmMode = "speaker" | "earphones" | "vibrate";

const getSnoozeRadius = (r: number): number | null => {
  if (r === 2) return 1;
  if (r === 1) return 0.5;
  if (r === 0.5) return 0.3;
  return null;
};

export default function TriggerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [alarmData, setAlarmData] = useState<AlarmData | null>(null);
  const [alarmMode, setAlarmMode] = useState<AlarmMode>("speaker");
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("alarmData").then((raw) => {
      if (raw) setAlarmData(JSON.parse(raw));
      else router.replace("/home");
    });
    stopLocationTracking();
    startAlarm();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => stopAlarm();
  }, []);

  const startAlarm = async () => {
    const raw = await AsyncStorage.getItem(SOUND_SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : {};
    const mode: AlarmMode = settings.mode ?? "speaker";
    const volume: number = settings.volume ?? 1.0;
    setAlarmMode(mode);

    if (mode === "vibrate") {
      // 500ms 진동, 300ms 정지 반복
      Vibration.vibrate([0, 500, 300], true);
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        // false = 스피커(후면), true = 이어폰/이어피스로 라우팅
        playThroughEarpieceAndroid: mode === "earphones",
        allowsRecordingIOS: false,
      });

      // 사운드 파일을 assets/sounds/alarm.mp3 에 추가하면 아래 주석 해제
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/alarm.mp3"),
        { shouldPlay: true, isLooping: true, volume },
      );
      soundRef.current = sound;
    } catch {}

    // 사운드 파일 없을 때 진동 폴백
    Vibration.vibrate([0, 500, 300], true);
  };

  const stopAlarm = () => {
    Vibration.cancel();
    if (soundRef.current) {
      soundRef.current.stopAsync();
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const handleDismiss = async () => {
    stopAlarm();
    await AsyncStorage.removeItem("alarmData");
    router.replace("/home");
  };

  const handleSnooze = async () => {
    if (!alarmData) return;
    const next = getSnoozeRadius(alarmData.radius);
    if (next === null) return;
    stopAlarm();
    const updated = { ...alarmData, radius: next };
    await AsyncStorage.setItem("alarmData", JSON.stringify(updated));
    router.replace("/active");
  };

  if (!alarmData) return null;

  const snoozeRadius = getSnoozeRadius(alarmData.radius);
  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.black, "#1a0000"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      {/* Status indicators */}
      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          {alarmMode === "earphones" && (
            <Headphones size={20} color={Colors.crimsonRed} strokeWidth={1.5} />
          )}
          {alarmMode === "speaker" && (
            <Volume2 size={20} color={Colors.crimsonRed} strokeWidth={1.5} />
          )}
          {alarmMode === "vibrate" && (
            <Vibrate size={20} color={Colors.crimsonRed} strokeWidth={1.5} />
          )}
          <Text style={styles.statusText}>
            {alarmMode === "earphones"
              ? "Earphones"
              : alarmMode === "speaker"
                ? "Speaker"
                : "Vibrate"}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Vibrate size={20} color={Colors.gray300} strokeWidth={1.5} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      {/* Pulsing icon */}
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}
        >
          <Power size={64} color={Colors.crimsonRed} strokeWidth={1.5} />
        </Animated.View>
      </View>

      {/* Message */}
      <View style={styles.messageBlock}>
        <Text style={styles.arrivingLabel}>Arriving At</Text>
        <Text style={styles.destination}>
          {alarmData.destination.toUpperCase()}
        </Text>
        <Text style={styles.addressText}>{alarmData.address}</Text>
        <View style={styles.redLine} />
      </View>

      {/* Radius info */}
      <View style={styles.radiusBadge}>
        <Text style={styles.radiusBadgeText}>
          Within{" "}
          <Text style={{ color: Colors.crimsonRed, fontWeight: "500" }}>
            {formatRadius(alarmData.radius)}
          </Text>{" "}
          radius
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>

        {snoozeRadius !== null ? (
          <TouchableOpacity onPress={handleSnooze}>
            <Text style={styles.snoozeText}>
              Snooze to {formatRadius(snoozeRadius)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.finalMessage}>
            <Text style={styles.finalText}>Time to get off!</Text>
          </View>
        )}
      </View>

      {/* Flash overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Colors.crimsonRed,
            opacity: flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.05],
            }),
          },
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray800,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: Colors.gray300,
    fontWeight: "300",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  iconWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: Colors.crimsonRed,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(211,47,47,0.1)",
  },
  messageBlock: {
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  arrivingLabel: {
    fontSize: 11,
    color: Colors.gray300,
    fontWeight: "300",
    letterSpacing: 5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  destination: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 40,
  },
  addressText: {
    fontSize: 14,
    color: Colors.gray400,
    fontWeight: "300",
    marginTop: 12,
  },
  redLine: {
    width: 96,
    height: 1,
    backgroundColor: Colors.crimsonRed,
    marginTop: 24,
  },
  radiusBadge: {
    alignSelf: "center",
    backgroundColor: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray800,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 32,
  },
  radiusBadgeText: { fontSize: 14, color: Colors.white, fontWeight: "300" },
  actions: { paddingHorizontal: 24, gap: 16 },
  dismissBtn: {
    backgroundColor: Colors.crimsonRed,
    paddingVertical: 28,
    borderRadius: 4,
    alignItems: "center",
  },
  dismissText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  snoozeText: {
    color: Colors.gray300,
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 16,
  },
  finalMessage: { paddingVertical: 16, alignItems: "center" },
  finalText: {
    color: Colors.gray300,
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
