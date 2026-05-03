import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haversineDistance, formatRadius } from '@/types/alarm';

export const LOCATION_TASK_NAME = 'background-location-task';

// Must be defined at module level (top-level, not inside a component)
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    // code 0 = kCLErrorLocationUnknown: transient error, CoreLocation will retry
    if ((error as any).code !== 0) console.error('Background location error:', error);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  const current = locations[0];
  if (!current) return;

  const alarmDataStr = await AsyncStorage.getItem('alarmData');
  if (!alarmDataStr) return;

  const alarmData = JSON.parse(alarmDataStr);
  const distance = haversineDistance(
    current.coords.latitude,
    current.coords.longitude,
    alarmData.lat,
    alarmData.lng
  );

  await AsyncStorage.setItem('currentDistance', String(distance.toFixed(2)));

  if (distance <= alarmData.radius) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    await AsyncStorage.setItem('alarmTriggered', 'true');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Arriving at ${alarmData.destination}`,
        body: `You are within ${formatRadius(alarmData.radius)} of your stop!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { screen: 'trigger' },
      },
      trigger: null,
    });
  }
});

export async function startLocationTracking(): Promise<void> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Background location permission denied');

  const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
  if (isTracking) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 30,
    foregroundService: {
      notificationTitle: 'Next Stop is active',
      notificationBody: 'Tracking your location...',
      notificationColor: '#D32F2F',
    },
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
  });
}

export async function stopLocationTracking(): Promise<void> {
  const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
  if (isTracking) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
