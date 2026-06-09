import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { appointmentService } from '../../services/appointments';
import { authService } from '../../services/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { Appointment } from '../../types';

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const session = await authService.getSession();
        if (!session?.user) {
          setError('User session not found.');
          return;
        }
        const data = await appointmentService.getPatientAppointments(session.user.id);
setAppointments(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((item) => {
    const isUpcoming = item.status === 'confirmed' || item.status === 'pending';
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
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
      <View style={[styles.center, { backgroundColor: activeBackground }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeBackground }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        {(['upcoming', 'past'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.segmentTab, activeTab === tab && [styles.segmentActive, { backgroundColor: activeSurface }]]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.segmentText, { color: activeTab === tab ? Colors.primary : activeSubtext }]}>
              {tab === 'upcoming' ? 'Upcoming' : 'Past History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={{ color: '#EF4444', fontSize: FontSize.sm }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={[styles.emptyText, { color: activeSubtext }]}>No scheduled appointments found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.appointmentCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.doctorName, { color: activeText }]}>Clinical Session</Text>
                  <Text style={[styles.specialtyText, { color: activeSubtext }]}>ID: {item.id.slice(0, 8)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  segmentContainer: { flexDirection: 'row', margin: Spacing.lg, marginBottom: Spacing.md, borderRadius: BorderRadius.sm, padding: 3 },
  segmentTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  segmentActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  segmentText: { fontSize: FontSize.sm, fontWeight: '600' },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  appointmentCard: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  doctorName: { fontSize: FontSize.md, fontWeight: '700', letterSpacing: -0.2 },
  specialtyText: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  divider: { height: 1, marginVertical: Spacing.md },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: FontSize.sm, fontWeight: '600' },
  notesContainer: { borderRadius: BorderRadius.sm, padding: Spacing.sm },
  notesLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  notesText: { fontSize: FontSize.xs, lineHeight: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md, opacity: 0.6 },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center', fontWeight: '500' },
});