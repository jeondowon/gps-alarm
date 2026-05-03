import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import '@/tasks/locationTask'; // register background task at startup

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/trigger');
    });
    return () => sub.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="sound-haptic" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="radius" />
      <Stack.Screen name="active" />
      <Stack.Screen name="trigger" options={{ animation: 'fade' }} />
    </Stack>
  );
}
