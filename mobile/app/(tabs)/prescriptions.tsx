import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { prescriptionService } from '../../services/prescriptions';
import { authService } from '../../services/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { Prescription } from '../../types';

export default function PrescriptionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const session = await authService.getSession();
        if (!session?.user) {
          setError('User session not found.');
          return;
        }
        const { data, error: apiError } = await prescriptionService.getPatientPrescriptions(session.user.id);
        if (apiError) throw apiError;
        setPrescriptions(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prescriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: activeBackground }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeBackground }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {error ? (
        <View style={styles.center}>
          <Text style={{ color: '#EF4444', fontSize: FontSize.sm }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={styles.emptyGraphic}>💊</Text>
              <Text style={[styles.emptyLabel, { color: activeSubtext }]}>No pharmaceutical scripts issued to this profile.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.prescriptionCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}>
              <View style={styles.cardHeader}>
                <View style={styles.headerTitleGroup}>
                  <Text style={[styles.diagnosisText, { color: activeText }]}>{item.diagnosis}</Text>
                  <Text style={[styles.physicianMeta, { color: activeSubtext }]}>Prescription Ref: {item.id.slice(0, 8)}</Text>
                </View>
                <View style={[styles.activeIndicator, { backgroundColor: Colors.secondary + '15' }]}>
                  <Text style={[styles.indicatorText, { color: Colors.secondary }]}>ACTIVE</Text>
                </View>
              </View>

              {item.notes && (
                <Text style={[styles.clinicalNotes, { color: activeSubtext }]}>
                  Instructions: "{item.notes}"
                </Text>
              )}

              {/* Dynamic Medication rendering fallback handling if nested data exists */}
              {item.medications && item.medications.length > 0 && (
                <View>
                  <Text style={[styles.nestedLabel, { color: activeText }]}>MEDICATIONS</Text>
                  <View style={styles.medicationStack}>
                    {item.medications.map((med) => (
                      <View key={med.id} style={[styles.medItemRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderLineColor }]}>
                        <View style={styles.medTitleLine}>
                          <Text style={[styles.medNameText, { color: activeText }]}>{med.name}</Text>
                          <Text style={[styles.medDosageText, { color: Colors.primary }]}>{med.dosage}</Text>
                        </View>
                        <Text style={[styles.medTimingText, { color: activeSubtext }]}>{med.frequency} • {med.duration}</Text>
                        {med.instructions && <Text style={[styles.medInstructionText, { color: activeSubtext }]}>ℹ️ {med.instructions}</Text>}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={[styles.horizontalDivider, { backgroundColor: borderLineColor }]} />
              <View style={styles.timelineFooterRow}>
                <Text style={[styles.dateBounds, { color: activeSubtext }]}>
                  ISSUED: <Text style={{ color: activeText }}>{item.issued_date}</Text>
                </Text>
                <Text style={[styles.dateBounds, { color: activeSubtext }]}>
                  REFILL UNTIL: <Text style={{ color: '#EF4444' }}>{item.valid_until}</Text>
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  listContainer: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  prescriptionCard: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  headerTitleGroup: { flex: 1, paddingRight: Spacing.sm },
  diagnosisText: { fontSize: FontSize.md, fontWeight: '700', letterSpacing: -0.2 },
  physicianMeta: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },
  activeIndicator: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  indicatorText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  clinicalNotes: { fontSize: FontSize.xs, fontStyle: 'italic', marginBottom: Spacing.md },
  nestedLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  medicationStack: { gap: Spacing.sm, marginBottom: Spacing.md },
  medItemRow: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md },
  medTitleLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  medNameText: { fontSize: FontSize.sm, fontWeight: '600' },
  medDosageText: { fontSize: FontSize.sm, fontWeight: '700' },
  medTimingText: { fontSize: FontSize.xs, fontWeight: '500', marginBottom: 4 },
  medInstructionText: { fontSize: FontSize.xs, lineHeight: 16 },
  horizontalDivider: { height: 1, marginBottom: Spacing.sm },
  timelineFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBounds: { fontSize: 10, fontWeight: '500' },
  emptyView: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyGraphic: { fontSize: 44, marginBottom: Spacing.md, opacity: 0.5 },
  emptyLabel: { fontSize: FontSize.sm, fontWeight: '500', textAlign: 'center' },
});
