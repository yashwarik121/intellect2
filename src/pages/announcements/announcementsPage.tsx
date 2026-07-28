import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { color } from '../../assets/colors/globalColor';

interface AnnouncementsPageProps {
  onClose?: () => void;
}

export default function AnnouncementsPage({ onClose }: AnnouncementsPageProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty State Body */}
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={{ fontSize: 36 }}>📢</Text>
        </View>
        <Text style={styles.emptyTitle}>No New Announcements</Text>
        <Text style={styles.emptySub}>
          There are currently no company announcements or broadcast messages. Check back later!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.textPrimary,
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: color.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
