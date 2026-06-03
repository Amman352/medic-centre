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
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

// Explicit alignment with your global types/index.ts MedicalRecord schema
interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  record_date: string;
  doctor_name?: string; // Hydrated join metadata
}

export default function RecordsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Theme Sync Tokens
  const activeBackground = isDark ? Colors.dark.background : Colors.background;
  const activeSurface = isDark ? Colors.dark.surface : Colors.surface;
  const activeText = isDark ? '#FFFFFF' : Colors.textPrimary;
  const activeSubtext = Colors.textSecondary;
  const borderLineColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        // Hydrating clinical test data matching standard diagnostic profiles
        const mockRecords: MedicalRecord[] = [
          {
            id: 'rec-001',
            patient_id: 'pat-01',
            doctor_id: 'doc-99',
            title: 'Complete Blood Count (CBC)',
            description: 'Standard metabolic wellness tracking panel. All metrics stable.',
            file_url: 'https://medic-centre.supabase.co/storage/v1/object/public/records/cbc-01.pdf',
            file_type: 'pdf',
            record_date: '2026-05-28',
            doctor_name: 'Dr. Sarah Jenkins',
          },
          {
            id: 'rec-002',
            patient_id: 'pat-01',
            doctor_id: 'doc-12',
            title: 'Chest X-Ray Digital Imaging',
            description: 'Post-viral bronchial structural examination. Clear bilateral fields.',
            file_url: 'https://medic-centre.supabase.co/storage/v1/object/public/records/xray-92.jpg',
            file_type: 'image/jpeg',
            record_date: '2026-04-15',
            doctor_name: 'Dr. Marcus Vance',
          },
        ];
        setRecords(mockRecords);
      } catch (err) {
        console.error('Error compiling laboratory record collection:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMedicalRecords();
  }, []);

  const getFileBadgeIcon = (fileType: string) => {
    return fileType.includes('pdf') ? '📄' : '🖼️';
  };

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
            <Text style={[styles.emptyLabel, { color: activeSubtext }]}>
              No health document logs linked to this profile.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.recordRowCard, { backgroundColor: activeSurface, borderColor: borderLineColor }]}
            activeOpacity={0.7}
          >
            <View style={styles.rowMainLayout}>
              {/* Left-side Format Indicator */}
              <View style={[styles.formatBadge, { backgroundColor: Colors.primary + '10' }]}>
                <Text style={styles.formatIcon}>{getFileBadgeIcon(item.file_type)}</Text>
              </View>

              {/* Text Meta Fields */}
              <View style={styles.metaDataBlock}>
                <Text style={[styles.recordTitleText, { color: activeText }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.issuingPhysician, { color: activeSubtext }]}>
                  Issued by {item.doctor_name}
                </Text>
                <Text style={[styles.recordBodySummary, { color: activeSubtext }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </View>

            <View style={[styles.dividerLine, { backgroundColor: borderLineColor }]} />

            {/* Bottom Info Ribbon */}
            <View style={styles.cardRibbonRow}>
              <Text style={[styles.timestampLabel, { color: activeSubtext }]}>
                RECORDED ON: <Text style={{ color: activeText, fontWeight: '600' }}>{item.record_date}</Text>
              </Text>
              <Text style={[styles.actionViewText, { color: Colors.primary }]}>
                View Document →
              </Text>
            </View>
          </TouchableOpacity>
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
  headerSpacer: {
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: '400',
  },
  recordRowCard: {
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
  rowMainLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  formatBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  formatIcon: {
    fontSize: 20,
  },
  metaDataBlock: {
    flex: 1,
  },
  recordTitleText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  issuingPhysician: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  recordBodySummary: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  dividerLine: {
    height: 1,
    marginBottom: Spacing.sm,
  },
  cardRibbonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  actionViewText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
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