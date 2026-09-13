import Board from '@/components/game/board';
import { ScreenBackground } from '@/components/screen-background';
import { BottomTabInset, MaxContentWidth, Spacing, Surface } from '@/constants/theme';
import { router, useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BACK_BUTTON_SIZE = 44;


export default function Game() {
  // Tab screens stay mounted after a blur, so the board is torn down whenever
  // the route loses focus and rebuilt from scratch on the next visit.
  
  const isFocused = useIsFocused();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [levelSettings, setLevelSettings] = useState  ({
    "level": 1,
    "durationSetting": 15000,
    "resetTimerSetting": true,
    "refillGridSetting": true,
    "colorBoxSetting": true,
    "textColorSetting": true,
    "gridLengthSetting": 3,
    "bombSetting": true,
    "blendInSetting": false,
    "comboLength": 5,
  })

  // The back button floats over the content, so the top inset also has to clear it.
  const contentPlatformStyle = Platform.select({
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    default: {
      paddingTop: insets.top + Spacing.two + BACK_BUTTON_SIZE,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
  });

  return (
    <ScreenBackground>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() =>  router.push("/explore")}
        style={({ pressed }) => [
          styles.backButton,
          {
            top: Platform.OS === 'web' ? Spacing.three : insets.top + Spacing.two,
            left: Platform.OS === 'web' ? Spacing.three : insets.left + Spacing.two,
          },
          pressed && styles.backButtonPressed,
        ]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={22}
          weight="bold"
          tintColor={Surface.text}
        />
      </Pressable>
      <View style={[styles.contentContainer, contentPlatformStyle]}>
        <View style={styles.container}>
          <View style={styles.sectionsWrapper}>
            <Board levelSettings={levelSettings} />
          </View>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    zIndex: 1,
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: BACK_BUTTON_SIZE / 2,
    backgroundColor: Surface.element,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    flex: 1,
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});