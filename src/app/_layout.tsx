import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';


SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="game" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="levels/[id]" options={{ headerShown: false, presentation: 'card' }} />

    </Stack>
  );
}
