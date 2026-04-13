import { Tabs } from 'expo-router';
import React from 'react';
import {
  View,
} from "react-native";
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAlertStore, AlertState } from '@/constants/useAlertStore'

export default function TabLayout() {
  const colorScheme = 'light';
  const hasNewAlert = useAlertStore((state) => state.hasNewAlert);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <View>
              <IconSymbol size={28} name="paperplane.fill" color={color} />
              {hasNewAlert && (
                <View
                  style={{
                    position: 'absolute',
                    right: -2,
                    top: -2,
                    backgroundColor: 'red',
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: 'white',
                  }}
                />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
