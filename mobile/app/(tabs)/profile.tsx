import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../../services/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Theme Sync Tokens
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const profileData = await authService.getProfile(session.user.id);
          if (profileData) {
            setProfile(profileData as Profile);
          }
        } else {
          // Fallback static profile configuration block for development runtime verification
          setProfile({
            id: 'usr-9281',
            full_name: 'Amman Kalim Khan',
            email: 'amman@domain.com',
            phone: '+91 98765 43210',
            role: 'patient',
            date_of_birth: '2004-11-18',
            gender: 'Male',
          });
        }
      } catch (err) {
        console.error('Error synchronizing patient identity layers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout processing exception encountered:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: activeBackground }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: activeBackground }]} showsVerticalScrollIndicator={false}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Avatar / Initials Hero Container */}
      <View style={styles.avatarSection}>
        <View style={[styles.initialsCircle, { backgroundColor: Colors.primary + '15' }]}>
          <Text style={[styles.initialsText, { color: Colors.primary }]}>
            {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: activeText }]}>{profile?.full_name}</Text>
        <Text style={[styles.roleBadge, { color: activeSubtext }]}>
          ACCOUNT VARIANT: {profile?.role?.toUpperCase()}
        </Text>
      </View>

      {/* Demographics Group Layer */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: activeSubtext }]}>PERSONAL PARAMETERS</Text>
        <View style={[styles.infoCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeSubtext }]}>Email Address</Text>
            <Text style={[styles.infoValue, { color: activeText }]}>{profile?.email}</Text>
          </View>
          
          <View style={[styles.rowDivider, { backgroundColor: borderLineColor }]} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeSubtext }]}>Contact Line</Text>
            <Text style={[styles.infoValue, { color: activeText }]}>{profile?.phone || 'Not Configured'}</Text>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: borderLineColor }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeSubtext }]}>Date of Birth</Text>
            <Text style={[styles.infoValue, { color: activeText }]}>{profile?.date_of_birth || 'Not Specified'}</Text>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: borderLineColor }]} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: activeSubtext }]}>Biological Gender</Text>
            <Text style={[styles.infoValue, { color: activeText }]}>{profile?.gender || 'Not Specified'}</Text>
          </View>

        </View>
      </View>

      {/* Account Control Vector */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: '#EF4444' }]} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Disconnect System Session</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  initialsCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  initialsText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
  },
  logoutButton: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
