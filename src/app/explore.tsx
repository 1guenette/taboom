import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LEVELS = Array.from({ length: 10 }, (_, index) => ({
  level: index + 1,
  score: 0,
  locked: index == 0 ? true : false
}));

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScreenBackground>
      <ScrollView
        style={styles.scrollView}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle">Levels</ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <ThemedText type="smallBold" style={styles.levelCell}>
                Level
              </ThemedText>
              <ThemedText type="smallBold" style={styles.scoreCell}>
                Score
              </ThemedText>
              <View style={styles.playCell}>
                <ThemedText type="smallBold" style={styles.playHeader}>
                  Play
                </ThemedText>
              </View>
            </View>

            {LEVELS.map((entry, i) => {
             
              const img = i == 0 ? 'play_arrow' : 'lock'
              const img_ios = i == 0 ? 'play.fill' : 'lock'
              return (
              <View key={entry.level} style={styles.row}>
                <ThemedText style={styles.levelCell}>{entry.level}</ThemedText>
                <ThemedText style={styles.scoreCell}>{entry.score}</ThemedText>
                <View style={styles.playCell}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Play level ${entry.level}`}
                    onPress={() => router.push('/game')}
                    style={({ pressed }) => pressed && styles.pressed}>
                    <ThemedView type="backgroundSelected" style={styles.playButtonInner}>
                      <SymbolView
                        tintColor={theme.text}
                        name={{ ios: img_ios, android: img, web: img }}
                        size={14}
                      />
                      <ThemedText type="smallBold">Play</ThemedText>
                    </ThemedView>
                  </Pressable>
                </View>
              </View>
            )})}
          </ThemedView>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  table: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.35)',
  },
  headerRow: {
    paddingVertical: Spacing.three,
  },
  levelCell: {
    flex: 1,
  },
  playCell: {
    flex: 1,
    alignItems: 'center',
  },
  playHeader: {
    textAlign: 'center',
  },
  scoreCell: {
    flex: 1,
    textAlign: 'center',
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
