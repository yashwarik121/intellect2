import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { SwalAlert, SwalType } from '../../components/common/SwalAlert';
import { color } from '../../assets/colors/globalColor';
import { leaveService, LeaveRequest } from '../../services/leaveService';

interface ApplyLeavePageProps {
  onClose?: () => void;
}

export default function ApplyLeavePage({ onClose }: ApplyLeavePageProps) {
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Loading & submission states
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Leave history array
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);

  // Swal Alert State
  const [swalState, setSwalState] = useState<{
    visible: boolean;
    type: SwalType;
    title: string;
    text: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    text: '',
  });

  const showSwal = (type: SwalType, title: string, text: string) => {
    setSwalState({ visible: true, type, title, text });
  };

  // GET API: Fetch existing leave requests
  const loadLeaveHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await leaveService.getLeaves();
      setLeaveHistory(data);
    } catch (err) {
      console.log('Error loading leave history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadLeaveHistory();
  }, []);

  // POST API: Submit leave request
  const handleSubmit = async () => {
    if (!startDate.trim() || !endDate.trim() || !reason.trim()) {
      showSwal('warning', 'Incomplete Form', 'Please fill in Start Date, End Date, and Reason.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: LeaveRequest = {
        employeeId: 'EMP1001',
        leaveType,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        reason: reason.trim(),
      };

      await leaveService.submitLeave(payload);
      setSubmitted(true);
      await loadLeaveHistory();

      // --- SWAL ALERT FOR LEAVE FORM SUBMISSION ---
      showSwal(
        'success',
        'Leave Form Submitted!',
        `Your ${leaveType} request (${startDate} to ${endDate}) has been posted for manager approval.`
      );
    } catch (err) {
      showSwal('error', 'Submission Failed', 'Failed to submit leave request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apply for Leave</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submitted ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Request Sent for Approval!</Text>
            <Text style={styles.successSub}>
              Your {leaveType} request ({startDate} to {endDate}) has been posted via POST /api/leaves and sent for manager approval.
            </Text>
            <CustomButton
              title="Submit Another Request"
              variant="secondary"
              onPress={() => {
                setSubmitted(false);
                setStartDate('');
                setEndDate('');
                setReason('');
              }}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Leave Request Form</Text>
            <Text style={styles.formSub}>Fill in details below to post a new leave request</Text>

            {/* Leave Type Selector */}
            <Text style={styles.fieldLabel}>Leave Type</Text>
            <View style={styles.typeSelectorRow}>
              {['Casual Leave', 'Sick Leave', 'Earned Leave'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, leaveType === t && styles.typeChipActive]}
                  onPress={() => setLeaveType(t)}
                >
                  <Text style={[styles.typeChipText, leaveType === t && styles.typeChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput
              label="Start Date"
              placeholder="e.g. 2026-08-05"
              value={startDate}
              onChangeText={setStartDate}
            />

            <CustomInput
              label="End Date"
              placeholder="e.g. 2026-08-07"
              value={endDate}
              onChangeText={setEndDate}
            />

            <CustomInput
              label="Reason for Leave"
              placeholder="Brief reason for your absence"
              value={reason}
              onChangeText={setReason}
            />

            {submitting ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={color.primaryGold} />
                <Text style={styles.loadingText}>Posting Leave Request (POST /api/leaves)...</Text>
              </View>
            ) : (
              <CustomButton
                title="Submit for Approval"
                onPress={handleSubmit}
                style={{ marginTop: 16 }}
              />
            )}
          </View>
        )}

        {/* Existing Leave Requests List */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Your Submitted Leave Requests (GET /api/leaves)</Text>

          {loadingHistory ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={color.primaryGold} />
              <Text style={styles.loadingText}>Fetching leave requests...</Text>
            </View>
          ) : (
            leaveHistory.map((item) => (
              <View key={item.id || item.startDate} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>{item.leaveType}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.status || 'PENDING'}</Text>
                  </View>
                </View>
                <Text style={styles.historyDates}>
                  📅 {item.startDate} to {item.endDate}
                </Text>
                <Text style={styles.historyReason}>Reason: {item.reason}</Text>
              </View>
            ))
          )}
        </View>

        {/* --- SWAL ALERT MODAL --- */}
        <SwalAlert
          visible={swalState.visible}
          type={swalState.type}
          title={swalState.title}
          text={swalState.text}
          onConfirm={() => setSwalState((prev) => ({ ...prev, visible: false }))}
        />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 4,
  },
  formSub: {
    fontSize: 14,
    color: color.textSecondary,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textPrimary,
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeChipActive: {
    backgroundColor: color.primaryLightGold,
    borderWidth: 1.5,
    borderColor: color.primaryGold,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textSecondary,
  },
  typeChipTextActive: {
    color: color.primaryDarkGold,
    fontWeight: 'bold',
  },
  loadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: color.primaryDarkGold,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 48,
    color: '#10B981',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: color.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  historySection: {
    marginTop: 8,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.textPrimary,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  historyDates: {
    fontSize: 13,
    color: color.textSecondary,
    marginBottom: 4,
  },
  historyReason: {
    fontSize: 13,
    color: color.textPrimary,
    fontStyle: 'italic',
  },
});
