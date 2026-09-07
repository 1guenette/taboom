import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { BackgroundGradient } from '@/components/screen-background';
import { Surface } from '@/constants/theme';

// Screens sit on the fixed navy `BackgroundGradient` in both color schemes, so the
// tab bar matches it rather than following the system light/dark palette. iOS only
// paints this background once content scrolls under the bar, so a mismatch here
// shows up as the bar changing color mid-scroll.
const TabBarBackground = BackgroundGradient[1];

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={TabBarBackground}
      blurEffect="systemChromeMaterialDark"
      indicatorColor={Surface.elementHeader}
      rippleColor={Surface.accentMuted}
      iconColor={{ default: Surface.textSecondary, selected: Surface.text }}
      labelStyle={{
        default: { color: Surface.textSecondary },
        selected: { color: Surface.text },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>


      <NativeTabs.Trigger name="game">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
