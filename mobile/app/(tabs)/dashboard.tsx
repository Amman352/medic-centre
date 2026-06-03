import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../../services/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface DashboardStats {
  upcomingAppointmentsCount: number;
  activePrescriptionsCount: number;
  recentRecordsCount: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Global Context state variables
  const [userName, setUserName] = useState<string>('Patient');
  const [userRole, setUserRole] = useState<string>('patient');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointmentsCount: 0,
    activePrescriptionsCount: 0,
    recentRecordsCount: 0,
  });

  // Dynamic Theme Styling Tokens
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  const fetchDashboardData = async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        if (profile) {
          setUserName(profile.full_name || 'User');
          setUserRole(profile.role || 'patient');
        }
      }
      
      // Simulating responsive metric layout counts for initial load state balancing
      setStats({
        upcomingAppointmentsCount: 1,
        activePrescriptionsCount: 2,
        recentRecordsCount: 4,
      });
    } catch (err) {
      console.error('Error hydrating dashboard payload:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: activeBackground }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: activeBackground }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Welcome Clinical Banner */}
      <View style={styles.welcomeBanner}>
        <Text style={[styles.greetingLabel, { color: activeSubtext }]}>WELCOME BACK</Text>
        <Text style={[styles.userNameText, { color: activeText }]}>
          {userRole === 'doctor' ? `Dr. ${userName}` : userName}
        </Text>
        <Text style={[styles.dateSubheading, { color: Colors.primary }]}>
          Thursday, June 4, 2026
        </Text>
      </View>

      {/* High Yield Health Metric Summary Cards */}
      <View style={styles.metricGrid}>
        <TouchableOpacity 
          style={[styles.metricCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}
          onPress={() => router.push('/(tabs)/appointments')}
        >
          <View style={[styles.iconBadge, { backgroundColor: Colors.primary + '15' }]}>
            <Text style={{ color: Colors.primary, fontSize: 18 }}>📅</Text>
          </View>
          <Text style={[styles.metricValue, { color: activeText }]}>{stats.upcomingAppointmentsCount}</Text>
          <Text style={[styles.metricLabel, { color: activeSubtext }]}>Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.metricCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}
          onPress={() => router.push('/(tabs)/prescriptions')}
        >
          <View style={[styles.iconBadge, { backgroundColor: Colors.secondary + '15' }]}>
            <Text style={{ color: Colors.secondary, fontSize: 18 }}>💊</Text>
          </View>
          <Text style={[styles.metricValue, { color: activeText }]}>{stats.activePrescriptionsCount}</Text>
          <Text style={[styles.metricLabel, { color: activeSubtext }]}>Prescriptions</Text>
        </TouchableOpacity>
      </View>

      {/* Main Feature Highlight Action List */}
      <Text style={[styles.sectionHeading, { color: activeText }]}>Quick Actions</Text>
      
      <View style={styles.actionColumn}>
        <TouchableOpacity 
          style={[styles.actionRowCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}
          onPress={() => router.push('/(tabs)/appointments')}
        >
          <View style={styles.actionRowLeft}>
            <Text style={styles.actionRowEmoji}>🩺</Text>
            <View style={styles.actionRowTextView}>
              <Text style={[styles.actionTitle, { color: activeText }]}>Book an Appointment</Text>
              <Text style={[styles.actionSubtitle, { color: activeSubtext }]}>Schedule clinical checkups or virtual calls</Text>
            </View>
          </View>
          <Text style={[styles.arrowIndicator, { color: activeSubtext }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionRowCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}
          onPress={() => router.push('/(tabs)/records')}
        >
          <View style={styles.actionRowLeft}>
            <Text style={styles.actionRowEmoji}>📂</Text>
            <View style={styles.actionRowTextView}>
              <Text style={[styles.actionTitle, { color: activeText }]}>Medical Lab Records</Text>
              <Text style={[styles.actionSubtitle, { color: activeSubtext }]}>Review historical tests and imaging data</Text>
            </View>
          </View>
          <Text style={[styles.arrowIndicator, { color: activeSubtext }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Notification / Advisory Banner */}
      <View style={[styles.advisoryBanner, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '30' }]}>
        <Text style={[styles.advisoryTitle, { color: Colors.primary }]}>System Health Advisory</Text>
        <Text style={[styles.advisoryBody, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
          Your next appointment scheduled with the practitioner will automatically sync local clinical telemetry records. Keep notifications enabled.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBanner: {
    marginBottom: Spacing.xl,
  },
  greetingLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  userNameText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dateSubheading: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  actionColumn: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionRowEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  actionRowTextView: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  actionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: '400',
  },
  arrowIndicator: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  advisoryBanner: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  advisoryTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  advisoryBody: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});