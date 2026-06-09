import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { recordsService } from '../../services/records';
import { authService } from '../../services/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { MedicalRecord } from '../../types';

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const session = await authService.getSession();
        if (!session?.user) {
          setError('User session not found.');
          return;
        }
        const data = await recordsService.getPatientRecords(session.user.id);
setRecords(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch medical records.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
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
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerSpacer}>
              <Text style={[styles.sectionSubtitle, { color: activeSubtext }]}>
                Verified clinical documents, diagnostics, and lab telemetry results.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={styles.emptyGraphic}>📂</Text>
              <Text style={[styles.emptyLabel, { color: activeSubtext }]}>No health document logs linked to this profile.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.recordRowCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]} activeOpacity={0.7}>
              <View style={styles.rowMainLayout}>
                <View style={[styles.formatBadge, { backgroundColor: Colors.primary + '10' }]}>
                  <Text style={styles.formatIcon}>{item.file_type?.includes('pdf') ? '📄' : '🖼️'}</Text>
                </View>
                <View style={styles.metaDataBlock}>
                  <Text style={[styles.recordTitleText, { color: activeText }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.recordBodySummary, { color: activeSubtext }]} numberOfLines={2}>{item.description}</Text>
                </View>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: borderLineColor }]} />
              <View style={styles.cardRibbonRow}>
                <Text style={[styles.timestampLabel, { color: activeSubtext }]}>
                  RECORDED ON: <Text style={{ color: activeText, fontWeight: '600' }}>{item.record_date}</Text>
                </Text>
                <Text style={[styles.actionViewText, { color: Colors.primary }]}>View Document →</Text>
              </View>
            </TouchableOpacity>
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
  headerSpacer: { marginBottom: Spacing.lg },
  sectionSubtitle: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: '400' },
  recordRowCard: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  rowMainLayout: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  formatBadge: { width: 44, height: 44, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  formatIcon: { fontSize: 20 },
  metaDataBlock: { flex: 1 },
  recordTitleText: { fontSize: FontSize.md, fontWeight: '700', letterSpacing: -0.2 },
  recordBodySummary: { fontSize: FontSize.xs, lineHeight: 16, marginTop: 4 },
  dividerLine: { height: 1, marginBottom: Spacing.sm },
  cardRibbonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timestampLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 0.3 },
  actionViewText: { fontSize: FontSize.xs, fontWeight: '600' },
  emptyView: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyGraphic: { fontSize: 44, marginBottom: Spacing.md, opacity: 0.5 },
  emptyLabel: { fontSize: FontSize.sm, fontWeight: '500', textAlign: 'center' },
});