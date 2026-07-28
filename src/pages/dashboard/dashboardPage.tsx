import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { IntellectLogo } from '../../components/common/IntellectLogo';
import { CustomButton } from '../../components/common/CustomButton';
import { color } from '../../assets/colors/globalColor';
import { storageService, RegisteredUser } from '../../services/storageService';

// Import action screens
import AttendanceHomePage from '../attendance/attendanceHomePage';
import ApplyLeavePage from '../leave/applyLeavePage';
import PaystubListPage from '../payroll/paystubListPage';
import AnnouncementsPage from '../announcements/announcementsPage';

interface DashboardPageProps {
  user?: RegisteredUser | null;
  onLogout: () => void;
}

type ActiveModal = 'NONE' | 'ATTENDANCE' | 'LEAVE' | 'PAYSTUBS' | 'ANNOUNCEMENTS';

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>('NONE');

  const handleLogoutPress = async () => {
    await storageService.clearSessionUser();
    onLogout();
  };

  const displayName = user?.fullName || 'Employee';
  const displayEmpId = user?.employeeId || 'EMP0000';
  const displayEmail = user?.email || 'employee@intellect.com';

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <IntellectLogo scale={0.7} />
        <TouchableOpacity style={styles.logoutIconButton} onPress={handleLogoutPress}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Banner Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ACTIVE EMPLOYEE</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Welcome back, {displayName}!</Text>
          <Text style={styles.welcomeSub}>
            Here is your daily portal overview and quick employee tools.
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>EMPLOYEE ID</Text>
              <Text style={styles.infoValue}>{displayEmpId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CORPORATE EMAIL</Text>
              <Text style={styles.infoValue}>{displayEmail}</Text>
            </View>
          </View>
        </View>

        {/* Quick Portal Action Cards */}
        <Text style={styles.sectionHeader}>Quick Employee Actions</Text>

        <View style={styles.gridContainer}>
          {/* 1. Attendance */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveModal('ATTENDANCE')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ fontSize: 22 }}>⏱️</Text>
            </View>
            <Text style={styles.cardTitle}>Attendance</Text>
            <Text style={styles.cardSub}>Clock in/out & calendar sheet</Text>
          </TouchableOpacity>

          {/* 2. Leave Request */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveModal('LEAVE')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Text style={{ fontSize: 22 }}>📅</Text>
            </View>
            <Text style={styles.cardTitle}>Leave Request</Text>
            <Text style={styles.cardSub}>Apply for approval</Text>
          </TouchableOpacity>

          {/* 3. Paystubs */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveModal('PAYSTUBS')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
              <Text style={{ fontSize: 22 }}>💵</Text>
            </View>
            <Text style={styles.cardTitle}>Paystubs</Text>
            <Text style={styles.cardSub}>View ₹40,000 monthly slips</Text>
          </TouchableOpacity>

          {/* 4. Announcements */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setActiveModal('ANNOUNCEMENTS')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Text style={{ fontSize: 22 }}>📢</Text>
            </View>
            <Text style={styles.cardTitle}>Announcements</Text>
            <Text style={styles.cardSub}>View company notices</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Logout Button */}
        <CustomButton
          title="Log Out of Portal"
          variant="secondary"
          onPress={handleLogoutPress}
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* --- FEATURE MODALS --- */}
      <Modal visible={activeModal === 'ATTENDANCE'} animationType="slide">
        <AttendanceHomePage onClose={() => setActiveModal('NONE')} />
      </Modal>

      <Modal visible={activeModal === 'LEAVE'} animationType="slide">
        <ApplyLeavePage onClose={() => setActiveModal('NONE')} />
      </Modal>

      <Modal visible={activeModal === 'PAYSTUBS'} animationType="slide">
        <PaystubListPage onClose={() => setActiveModal('NONE')} />
      </Modal>

      <Modal visible={activeModal === 'ANNOUNCEMENTS'} animationType="slide">
        <AnnouncementsPage onClose={() => setActiveModal('NONE')} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
  },
  headerBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logoutIconButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: color.accentRed,
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: color.primaryDarkGold,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: color.accentRed,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  welcomeSub: {
    color: '#FFF3C4',
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justify.content: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: color.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: color.textSecondary,
  },
});
