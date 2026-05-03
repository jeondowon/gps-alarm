import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('onboardingComplete').then((val) => {
      if (val) {
        router.replace('/home');
      } else {
        router.replace('/splash');
      }
    });
  }, []);

  return null;
}
