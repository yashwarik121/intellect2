import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CustomButton } from '../../components/common/CustomButton';
import { SwalAlert, SwalType } from '../../components/common/SwalAlert';
import { color } from '../../assets/colors/globalColor';

interface AttendanceHomePageProps {
  onClose?: () => void;
}

// Generate calendar days with status for July 2026
const monthDays = Array.from({ length: 31 }, (_, i) => {
  const dayNum = i + 1;
  const dayOfWeek = (dayNum + 2) % 7;
  let status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'WEEKEND' = 'PRESENT';

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    status = 'WEEKEND';
  } else if (dayNum === 5 || dayNum === 14 || dayNum === 22) {
    status = 'ABSENT';
  } else if (dayNum === 9 || dayNum === 19 || dayNum === 27) {
    status = 'HALF_DAY';
  } else {
    status = 'PRESENT';
  }

  return { day: dayNum, status };
});

export default function AttendanceHomePage({ onClose }: AttendanceHomePageProps) {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  const handleClockInToggle = () => {
    if (!clockedIn) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setClockedIn(true);
      setClockInTime(now);

      // --- SWAL ALERT FOR CLOCK IN ---
      showSwal(
        'success',
        'Clock In Successful!',
        `Your attendance for today has been logged at ${now}.`
      );
    } else {
      setClockedIn(false);
      setClockInTime(null);

      // --- SWAL ALERT FOR CLOCK OUT ---
      showSwal(
        'info',
        'Clock Out Recorded!',
        'You have successfully clocked out for today. Have a great evening!'
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return '#10B981';
      case 'ABSENT':
        return '#EF4444';
      case 'HALF_DAY':
        return '#F59E0B';
      default:
        return '#E5E7EB';
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Calendar Sheet</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Clock In / Clock Out Card */}
        <View style={styles.clockCard}>
          <Text style={styles.clockTitle}>Today's Status</Text>
          <Text style={styles.clockTimeText}>
            {clockedIn ? `Clocked In at ${clockInTime}` : 'Not Clocked In'}
          </Text>

          <CustomButton
            title={clockedIn ? 'Clock Out Now' : 'Clock In Now'}
            variant={clockedIn ? 'danger' : 'primary'}
            onPress={handleClockInToggle}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Month Selector & Title */}
        <View style={styles.monthHeaderRow}>
          <Text style={styles.monthTitle}>July 2026 Attendance</Text>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Half Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={styles.legendText}>Weekend</Text>
          </View>
        </View>

        {/* Calendar Grid Header Days */}
        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Text key={d} style={styles.weekHeaderDay}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Grid Days */}
        <View style={styles.calendarGrid}>
          {monthDays.map((item) => {
            const statusColor = getStatusColor(item.status);
            const isSelected = selectedDay === item.day;

            return (
              <TouchableOpacity
                key={item.day}
                style={[
                  styles.dayBox,
                  { backgroundColor: item.status === 'WEEKEND' ? '#F3F4F6' : '#FFFFFF' },
                  isSelected && styles.dayBoxSelected,
                ]}
                onPress={() => setSelectedDay(item.day)}
              >
                <Text style={[styles.dayNumber, item.status === 'WEEKEND' && styles.dayNumberWeekend]}>
                  {item.day}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusBadgeText}>
                    {item.status === 'PRESENT'
                      ? 'P'
                      : item.status === 'ABSENT'
                      ? 'A'
                      : item.status === 'HALF_DAY'
                      ? 'H'
                      : '-'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedDay !== null && (
          <View style={styles.selectedDetailCard}>
            <Text style={styles.selectedDetailTitle}>Details for July {selectedDay}, 2026</Text>
            <Text style={styles.selectedDetailText}>
              Status:{' '}
              <Text style={{ fontWeight: 'bold', color: getStatusColor(monthDays[selectedDay - 1].status) }}>
                {monthDays[selectedDay - 1].status}
              </Text>
            </Text>
          </View>
        )}
      </ScrollView>

      {/* --- SWAL ALERT MODAL --- */}
      <SwalAlert
        visible={swalState.visible}
        type={swalState.type}
        title={swalState.title}
        text={swalState.text}
        onConfirm={() => setSwalState((prev) => ({ ...prev, visible: false }))}
      />
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
  clockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
  },
  clockTitle: {
    fontSize: 14,
    color: color.textSecondary,
    fontWeight: '600',
  },
  clockTimeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color.primaryDarkGold,
    marginVertical: 4,
  },
  monthHeaderRow: {
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.textPrimary,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textSecondary,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekHeaderDay: {
    width: 44,
    textAlign: 'center',
    fontWeight: '700',
    color: color.textSecondary,
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayBox: {
    width: '13.2%',
    height: 54,
    margin: '0.5%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayBoxSelected: {
    borderColor: color.primaryGold,
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 2,
  },
  dayNumberWeekend: {
    color: '#9CA3AF',
  },
  statusBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  selectedDetailCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: color.primaryGold,
  },
  selectedDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 4,
  },
  selectedDetailText: {
    fontSize: 13,
    color: color.textSecondary,
  },
});
