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
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

// Layout contracts mirroring types/index.ts schema interfaces
interface Medication {
  id: string;
  prescription_id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  notes: string;
  issued_date: string;
  valid_until: string;
  doctor_name?: string; // Hydrated join lookup metadata
  medications: Medication[];
}

export default function PrescriptionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Theme Sync Tokens
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const loadPrescriptionRegimen = async () => {
      try {
        // Hydrating clinical pharmacology regimens matching standard therapeutic plans
        const mockPrescriptions: Prescription[] = [
          {
            id: 'rx-701',
            patient_id: 'pat-01',
            doctor_id: 'doc-99',
            diagnosis: 'Hypertension Management',
            notes: 'Monitor resting blood pressure daily in the morning layer.',
            issued_date: '2026-05-20',
            valid_until: '2026-11-20',
            doctor_name: 'Dr. Sarah Jenkins',
            medications: [
              {
                id: 'med-901',
                prescription_id: 'rx-701',
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Once daily',
                duration: '6 Months',
                instructions: 'Take in the morning with water before food breakfast routine.',
              },
              {
                id: 'med-902',
                prescription_id: 'rx-701',
                name: 'Amlodipine',
                dosage: '5mg',
                frequency: 'Once daily',
                duration: '6 Months',
                instructions: 'Take before sleep if evening telemetry numbers spike.',
              }
            ]
          }
        ];
        setPrescriptions(mockPrescriptions);
      } catch (err) {
        console.error('Error hydrating pharmaceutical array sets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptionRegimen();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: activeBackground }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeBackground }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyGraphic}>💊</Text>
            <Text style={[styles.emptyLabel, { color: activeSubtext }]}>
              No pharmaceutical scripts issued to this profile.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.prescriptionCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}>
            {/* Treatment Header */}
            <View style={styles.cardHeader}>
              <View style={styles.headerTitleGroup}>
                <Text style={[styles.diagnosisText, { color: activeText }]}>{item.diagnosis}</Text>
                <Text style={[styles.physicianMeta, { color: activeSubtext }]}>
                  Prescribed by {item.doctor_name}
                </Text>
              </View>
              <View style={[styles.activeIndicator, { backgroundColor: Colors.secondary + '15' }]}>
                <Text style={[styles.indicatorText, { color: Colors.secondary }]}>ACTIVE</Text>
              </View>
            </View>

            <Text style={[styles.clinicalNotes, { color: activeSubtext }]}>
              Instructions: "{item.notes}"
            </Text>

            {/* Embedded Medication Component List */}
            <Text style={[styles.nestedLabel, { color: activeText }]}>MEDICATIONS</Text>
            <View style={styles.medicationStack}>
              {item.medications.map((med) => (
                <View key={med.id} style={[styles.medItemRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderLineColor }]}>
                  <View style={styles.medTitleLine}>
                    <Text style={[styles.medNameText, { color: activeText }]}>{med.name}</Text>
                    <Text style={[styles.medDosageText, { color: Colors.primary }]}>{med.dosage}</Text>
                  </View>
                  <Text style={[styles.medTimingText, { color: activeSubtext }]}>
                    {med.frequency} • {med.duration}
                  </Text>
                  <Text style={[styles.medInstructionText, { color: activeSubtext }]}>
                    ℹ️ {med.instructions}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.horizontalDivider, { backgroundColor: borderLineColor }]} />

            {/* Timeline Integrity Footer */}
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
    </View>
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
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  prescriptionCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  diagnosisText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  physicianMeta: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clinicalNotes: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  nestedLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  medicationStack: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  medItemRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  medTitleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  medNameText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  medDosageText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  medTimingText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginBottom: 4,
  },
  medInstructionText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  horizontalDivider: {
    height: 1,
    marginBottom: Spacing.sm,
  },
  timelineFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBounds: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyGraphic: {
    fontSize: 44,
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});