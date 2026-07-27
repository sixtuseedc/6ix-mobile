// app/(tabs)/_layout.tsx
import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";
import { useAppTheme } from "../../src/context/AppContext";

function TabIcon({ symbol, focused, color }: { symbol: string; focused: boolean; color: string }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5, color }}>{symbol}</Text>;
}

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.tabBarBackground, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color }) => <TabIcon symbol="🏠" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color }) => <TabIcon symbol="💬" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => <TabIcon symbol="⚙️" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
