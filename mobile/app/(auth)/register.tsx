import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../../services/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

type UserRole = 'patient' | 'doctor';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme Syncing
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const segmentedControlBg = isDark ? '#334155' : '#E2E8F0';

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authService.register(
        email.trim(),
        password.trim(),
        fullName.trim(),
        role
      );

      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (err) {
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: activeBackground }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: activeText }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: activeSubtext }]}>
            Set up your clinical or patient health profile.
          </Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: '#EF444415', borderColor: '#EF4444' }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={[styles.inputLabel, { color: activeText }]}>FULL NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeSurface, color: activeText, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            placeholder="Dr. Alex Taylor or Jane Doe"
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            textContentType="name"
          />

          <Text style={[styles.inputLabel, { color: activeText }]}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeSurface, color: activeText, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            placeholder="yourname@domain.com"
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <Text style={[styles.inputLabel, { color: activeText }]}>PASSWORD</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeSurface, color: activeText, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            placeholder="Minimum 6 characters"
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          {/* Account Role Selector */}
          <Text style={[styles.inputLabel, { color: activeText }]}>ACCOUNT TYPE</Text>
          <View style={[styles.segmentedControl, { backgroundColor: segmentedControlBg }]}>
            <TouchableOpacity
              style={[
                styles.segmentButton, 
                role === 'patient' && { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
              ]}
              onPress={() => setRole('patient')}
            >
              <Text style={[
                styles.segmentText, 
                { color: role === 'patient' ? Colors.primary : activeSubtext },
                role === 'patient' && styles.activeSegmentText
              ]}>
                Patient
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton, 
                role === 'doctor' && { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
              ]}
              onPress={() => setRole('doctor')}
            >
              <Text style={[
                styles.segmentText, 
                { color: role === 'doctor' ? Colors.primary : activeSubtext },
                role === 'doctor' && styles.activeSegmentText
              ]}>
                Medical Professional
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: Colors.primary }, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Register Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: activeSubtext }]}>Already registered? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.xl 
  },
  headerContainer: { 
    alignItems: 'flex-start', 
    marginBottom: Spacing.xl 
  },
  title: { 
    fontSize: FontSize.xl, 
    fontWeight: '700', 
    letterSpacing: -0.5, 
    marginBottom: Spacing.xs 
  },
  subtitle: { 
    fontSize: FontSize.md, 
    fontWeight: '400' 
  },
  formContainer: { 
    width: '100%', 
    marginBottom: Spacing.lg 
  },
  inputLabel: { 
    fontSize: FontSize.xs, 
    fontWeight: '600', 
    letterSpacing: 0.5, 
    marginBottom: Spacing.sm, 
    marginLeft: Spacing.xs 
  },
  input: { 
    height: 52, 
    borderRadius: BorderRadius.md, 
    paddingHorizontal: Spacing.md, 
    fontSize: FontSize.md, 
    marginBottom: Spacing.md, 
    borderWidth: 1 
  },
  errorBanner: { 
    borderWidth: 1, 
    borderRadius: BorderRadius.md, 
    padding: Spacing.md, 
    marginBottom: Spacing.md 
  },
  errorText: { 
    color: '#EF4444', 
    fontSize: FontSize.sm, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  segmentedControl: { 
    flexDirection: 'row', 
    height: 46, 
    borderRadius: BorderRadius.sm, 
    padding: 3, 
    marginBottom: Spacing.lg 
  },
  segmentButton: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 6 
  },
  segmentText: { 
    fontSize: FontSize.sm, 
    fontWeight: '500' 
  },
  activeSegmentText: { 
    fontWeight: '600' 
  },
  primaryButton: { 
    height: 52, 
    borderRadius: BorderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: FontSize.md, 
    fontWeight: '600' 
  },
  footerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: Spacing.sm 
  },
  footerText: { 
    fontSize: FontSize.sm 
  },
  linkText: { 
    fontSize: FontSize.sm, 
    fontWeight: '600' 
  },
});