import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ViewProps } from 'react-native';

// Radial gradients aren't supported by expo-linear-gradient, so this
// approximates the web version's radial background with a linear one.
export const BackgroundGradient = ['#1e2749', '#10142b'] as const;

export function ScreenBackground({ style, ...props }: ViewProps) {
  return (
    <LinearGradient colors={BackgroundGradient} style={[styles.background, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
