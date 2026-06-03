import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

// Explicit alignment with global types/index.ts Interface Contract
interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  doctor_name?: string; // Hydrated lookup attribute
  specialty?: string;
}

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Theme Sync Tokens
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    // Mock loading sequence matching appointment hydration pipeline contracts
    const loadAppointmentsData = async () => {
      try {
        const mockPayload: Appointment[] = [
          {
            id: 'apt-101',
            patient_id: 'pat-01',
            doctor_id: 'doc-99',
            doctor_name: 'Dr. Sarah Jenkins',
            specialty: 'Cardiologist',
            appointment_date: '2026-06-12',
            appointment_time: '10:30 AM',
            status: 'confirmed',
            notes: 'Routine cardiovascular metric tracing and biometrics update.',
          },
          {
            id: 'apt-102',
            patient_id: 'pat-01',
            doctor_id: 'doc-45',
            doctor_name: 'Dr. Robert Chen',
            specialty: 'Dermatologist',
            appointment_date: '2026-05-14',
            appointment_time: '02:15 PM',
            status: 'completed',
            notes: 'Follow-up assessment regarding therapeutic script responses.',
          }
        ];
        setAppointments(mockPayload);
      } catch (err) {
        console.error('Error matching diagnostic session arrays:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentsData();
  }, []);

  // Filter schedules strictly based on timeline status mappings
  const filteredAppointments = appointments.filter((item) => {
    if (activeTab === 'upcoming') {
      return item.status === 'confirmed' || item.status === 'pending';
    }
    return item.status === 'completed' || item.status === 'cancelled';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return Colors.secondary;
      case 'completed': return Colors.textSecondary;
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return Colors.primary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrapper, { backgroundColor: activeBackground }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeBackground }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Segmented Control Bar */}
      <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'upcoming' && [styles.segmentActive, { backgroundColor: activeSurface }]]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.segmentText, { color: activeTab === 'upcoming' ? Colors.primary : activeSubtext }]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'past' && [styles.segmentActive, { backgroundColor: activeSurface }]]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.segmentText, { color: activeTab === 'past' ? Colors.primary : activeSubtext }]}>
            Past History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Cards Timeline */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={[styles.emptyText, { color: activeSubtext }]}>
              No scheduled appointments found in this view.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.appointmentCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.doctorName, { color: activeText }]}>{item.doctor_name}</Text>
                <Text style={[styles.specialtyText, { color: activeSubtext }]}>{item.specialty}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: borderLineColor }]} />

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: activeSubtext }]}>DATE</Text>
                <Text style={[styles.detailValue, { color: activeText }]}>{item.appointment_date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: activeSubtext }]}>TIME</Text>
                <Text style={[styles.detailValue, { color: activeText }]}>{item.appointment_time}</Text>
              </View>
            </View>

            {item.notes && (
              <View style={[styles.notesContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={[styles.notesLabel, { color: activeSubtext }]}>CLINICAL NOTES</Text>
                <Text style={[styles.notesText, { color: activeText }]}>{item.notes}</Text>
              </View>
            )}
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
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    margin: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  appointmentCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
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
  },
  doctorName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  specialtyText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  notesContainer: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
});