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

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State Management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Theme Adaptability
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authService.login(
        email.trim(),
        password.trim()
      );

      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
        {/* Medical App Branding Minimalist Header */}
        <View style={styles.headerContainer}>
          <View style={[styles.brandIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Text style={[styles.brandEmoji, { color: Colors.primary }]}>✦</Text>
          </View>
          <Text style={[styles.title, { color: activeText }]}>Medic Centre</Text>
          <Text style={[styles.subtitle, { color: activeSubtext }]}>
            Your health ecosystem, unified.
          </Text>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formContainer}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: '#EF444415', borderColor: '#EF4444' }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={[styles.inputLabel, { color: activeText }]}>EMAIL ADDRESS</Text>
          <TextInput
            style={[styles.input, { backgroundColor: activeSurface, color: activeText, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
            placeholder="name@hospital.com"
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
            placeholder="Enter secure password"
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: Colors.primary }, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Navigation Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: activeSubtext }]}>New to Medic Centre? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Create an Account</Text>
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
    alignItems: 'center', 
    marginBottom: Spacing.xl 
  },
  brandIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: BorderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: Spacing.md 
  },
  brandEmoji: { 
    fontSize: FontSize.xl, 
    fontWeight: '700' 
  },
  title: { 
    fontSize: FontSize.xl, 
    fontWeight: '700', 
    letterSpacing: -0.5, 
    marginBottom: Spacing.xs 
  },
  subtitle: { 
    fontSize: FontSize.md, 
    fontWeight: '400',
    textAlign: 'center'
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
    marginTop: Spacing.md 
  },
  footerText: { 
    fontSize: FontSize.sm 
  },
  linkText: { 
    fontSize: FontSize.sm, 
    fontWeight: '600' 
  },
});