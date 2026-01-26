import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="cart" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
// Rebuild trigger
