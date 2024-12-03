import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Image } from "expo-image";
import { wp } from "@/utils/dimonsion";
import { StatusBar, Text } from "react-native";
import { Colors } from "@/constants/Colors";
export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "tab1",
};

const iconColor = {
  activeIcon: Colors.dark.tabIconSelected,
  inactiveIcon: Colors.dark.tabIconDefault,
};

const Layout = () => {
  return (
    <>
      <StatusBar className="bg-zinc-950" />

      <Tabs
        screenOptions={{
          animation: "shift",
          tabBarStyle: {
            backgroundColor: Colors.dark.background,
          },
          tabBarLabelStyle: {
            color: Colors.dark.tabIconDefault,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="home"
                size={24}
                color={focused ? iconColor.activeIcon : iconColor.inactiveIcon}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel text="Home" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="notifications"
                size={24}
                color={focused ? iconColor.activeIcon : iconColor.inactiveIcon}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel text="Notification" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            headerShown: false,
            tabBarIcon: () => (
              <Image
                style={{
                  height: wp(7),
                  width: wp(7),
                  borderRadius: wp(7),
                }}
                source={{
                  uri: "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg",
                }}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel text="user" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

const TabBarLabel = ({ focused, text }: { focused: boolean; text: string }) => (
  <Text
    style={{
      color: focused ? iconColor.activeIcon : iconColor.inactiveIcon,
      fontSize: wp(2.4),
    }}
  >
    {text}
  </Text>
);

export default Layout;
