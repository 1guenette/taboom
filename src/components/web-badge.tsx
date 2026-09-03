import { StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        Levick Labs LLC
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});
