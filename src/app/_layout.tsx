import { migrateDbIfNeeded } from '@/db/sql';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // useEffect(() => {
  //   // Hide the splash once the layout has mounted
  //   SplashScreen.hideAsync();
  // }, []);

  return (
    // <Suspense fallback={null}>
      <SQLiteProvider
        databaseName="test.db"
        onInit={migrateDbIfNeeded}
        // useSuspense
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game" options={{ presentation: 'card' }} />
          <Stack.Screen name="levels/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </SQLiteProvider>
    // </Suspense>
  );
}