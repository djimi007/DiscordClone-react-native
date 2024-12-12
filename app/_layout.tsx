import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "react-native-gesture-handler";

// SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(setup)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
