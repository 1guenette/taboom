import Board from '@/components/game/board';
import { ScreenBackground } from '@/components/screen-background';
import { BottomTabInset, MaxContentWidth, Spacing, Surface } from '@/constants/theme';
import { router, useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
      <ScrollView
        style={styles.scrollView}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
        <View style={styles.container}>
          {/* <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Game</ThemedText>
        </ThemedView> */}

          <View style={styles.sectionsWrapper}>
            <Board />
          </View>
        </View>
      </ScrollView>
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