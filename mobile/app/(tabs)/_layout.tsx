import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, FontSize } from '../../constants/theme';

// Custom lightweight tab bar icon renderer using text nodes to keep core native dependency clean
function TabIcon({ label, focused, isDark }: { label: string; focused: boolean; isDark: boolean }) {
  const activeColor = Colors.primary;
  const inactiveColor = Colors.textSecondary;

  return (
    <View style={styles.iconWrapper}>
      <Text style={[styles.iconText, { color: focused ? activeColor : inactiveColor }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const activeBackground = isDark ? Colors.dark.surface : Colors.surface;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';
  const activeHeaderBg = isDark ? Colors.dark.background : Colors.surface;
  const activeHeaderText = isDark ? '#FFFFFF' : Colors.textPrimary;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: activeBackground,
          borderTopWidth: 1,
          borderTopColor: borderLineColor,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: activeHeaderBg,
          borderBottomWidth: 1,
          borderBottomColor: borderLineColor,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          fontSize: FontSize.lg,
          fontWeight: '700',
          color: activeHeaderText,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Medic Centre',
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} isDark={isDark} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          headerTitle: 'My Appointments',
          tabBarIcon: ({ focused }) => <TabIcon label="📅" focused={focused} isDark={isDark} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          headerTitle: 'Medical Records',
          tabBarIcon: ({ focused }) => <TabIcon label="📂" focused={focused} isDark={isDark} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          headerTitle: 'Prescriptions',
          tabBarIcon: ({ focused }) => <TabIcon label="💊" focused={focused} isDark={isDark} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} isDark={isDark} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    lineHeight: FontSize.xl + 2,
  },
});