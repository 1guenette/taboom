import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing, Surface } from '@/constants/theme';

const LEVELS = Array.from({ length: 10 }, (_, index) => ({
  level: index + 1,
  score: index == 0 ? 0 : null,
  locked: index == 0 ? true : false
}));

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
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

          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <ThemedText type="smallBold" style={[styles.levelCell, styles.headerText]}>
                Level
              </ThemedText>
              <ThemedText type="smallBold" style={[styles.scoreCell, styles.headerText]}>
                Score
              </ThemedText>
              <View style={styles.playCell}>
                <ThemedText type="smallBold" style={[styles.playHeader, styles.headerText]}>
                  Play
                </ThemedText>
              </View>
            </View>

            {LEVELS.map((entry, i) => {
              const unlocked = i == 0
              const img = unlocked ? 'play_arrow' : 'lock'
              const img_ios = unlocked ? 'play.fill' : 'lock'
              return (
              <View
                key={entry.level}
                style={[
                  styles.row,
                  i % 2 == 1 && styles.rowAlt,
                  i == LEVELS.length - 1 && styles.rowLast,
                ]}>
                <ThemedText style={[styles.levelCell, styles.cellText]}>{entry.level}</ThemedText>
                <ThemedText style={[styles.scoreCell, styles.scoreText]}>{entry.score}</ThemedText>
                <View style={styles.playCell}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Play level ${entry.level}`}
                    onPress={() => router.push('/game')}
                    style={({ pressed }) => pressed && styles.pressed}>
                    <View
                      style={[
                        styles.playButtonInner,
                        unlocked ? styles.playButtonUnlocked : styles.playButtonLocked,
                      ]}>
                      <SymbolView
                        tintColor={unlocked ? Surface.text : Surface.textSecondary}
                        name={{ ios: img_ios, android: img, web: img }}
                        size={14}
                      />
                      <ThemedText
                        type="smallBold"
                        style={unlocked ? styles.playLabel : styles.playLabelLocked}>
                        Play
                      </ThemedText>
                    </View>
                  </Pressable>
                </View>
              </View>
            )})}
          </View>
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
    backgroundColor: Surface.element,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Surface.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Surface.border,
  },
  rowAlt: {
    backgroundColor: Surface.accentMuted,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  headerRow: {
    paddingVertical: Spacing.three,
    backgroundColor: Surface.elementHeader,
  },
  headerText: {
    color: Surface.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cellText: {
    color: Surface.text,
  },
  scoreText: {
    color: Surface.textSecondary,
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
  playButtonUnlocked: {
    backgroundColor: Surface.accent,
  },
  playButtonLocked: {
    backgroundColor: Surface.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Surface.border,
  },
  playLabel: {
    color: Surface.text,
  },
  playLabelLocked: {
    color: Surface.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
