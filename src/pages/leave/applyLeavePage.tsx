import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { color } from '../../assets/colors/globalColor';

interface ApplyLeavePageProps {
  onClose?: () => void;
}

export default function ApplyLeavePage({ onClose }: ApplyLeavePageProps) {
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
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
              Your {leaveType} request ({startDate || 'Upcoming'} to {endDate || 'Upcoming'}) has been submitted to your manager for approval.
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
            <Text style={styles.formSub}>Fill in details below to apply for approval</Text>

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

            <CustomButton
              title="Submit for Approval"
              onPress={handleSubmit}
              style={{ marginTop: 16 }}
            />
          </View>
        )}
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
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    marginTop: 20,
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
});
