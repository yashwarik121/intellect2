import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { color } from '../../assets/colors/globalColor';

interface PaystubListPageProps {
  onClose?: () => void;
}

interface PaystubItem {
  id: string;
  month: string;
  year: number;
  netPay: string;
  basic: string;
  allowances: string;
  deductions: string;
  status: string;
  payDate: string;
}

const staticPaystubs: PaystubItem[] = [
  {
    id: '1',
    month: 'June',
    year: 2026,
    netPay: '₹40,000',
    basic: '₹30,000',
    allowances: '₹12,000',
    deductions: '₹2,000',
    status: 'PAID',
    payDate: 'June 30, 2026',
  },
  {
    id: '2',
    month: 'May',
    year: 2026,
    netPay: '₹40,000',
    basic: '₹30,000',
    allowances: '₹12,000',
    deductions: '₹2,000',
    status: 'PAID',
    payDate: 'May 31, 2026',
  },
];

export default function PaystubListPage({ onClose }: PaystubListPageProps) {
  const [selectedPaystub, setSelectedPaystub] = useState<PaystubItem | null>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salary Payslips</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedPaystub ? (
          // Details View
          <View style={styles.detailsCard}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedPaystub(null)}>
              <Text style={styles.backButtonText}>← Back to Payslips List</Text>
            </TouchableOpacity>

            <View style={styles.detailsHeader}>
              <Text style={styles.detailsMonth}>
                {selectedPaystub.month} {selectedPaystub.year} Payslip
              </Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>{selectedPaystub.status}</Text>
              </View>
            </View>

            <Text style={styles.payDateText}>Payment Date: {selectedPaystub.payDate}</Text>

            <View style={styles.divider} />

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Basic Salary</Text>
              <Text style={styles.breakdownVal}>{selectedPaystub.basic}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>HRA & Allowances</Text>
              <Text style={styles.breakdownVal}>{selectedPaystub.allowances}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>PF & Tax Deductions</Text>
              <Text style={[styles.breakdownVal, { color: color.accentRed }]}>
                -{selectedPaystub.deductions}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.netPayRow}>
              <Text style={styles.netPayLabel}>Net Salary Paid</Text>
              <Text style={styles.netPayValue}>{selectedPaystub.netPay}</Text>
            </View>
          </View>
        ) : (
          // List View
          <View>
            <Text style={styles.sectionTitle}>Recent Salary Statements</Text>

            {staticPaystubs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.paystubCard}
                onPress={() => setSelectedPaystub(item)}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.monthName}>
                    {item.month} {item.year}
                  </Text>
                  <Text style={styles.cardSubText}>Paid on {item.payDate}</Text>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.amountText}>{item.netPay}</Text>
                  <Text style={styles.viewDetailText}>View Breakdown →</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 16,
  },
  paystubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLeft: {},
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 4,
  },
  cardSubText: {
    fontSize: 13,
    color: color.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.primaryDarkGold,
    marginBottom: 4,
  },
  viewDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.accentRed,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: color.primaryDarkGold,
    fontWeight: '700',
    fontSize: 14,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailsMonth: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color.textPrimary,
  },
  paidBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  paidBadgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  payDateText: {
    fontSize: 13,
    color: color.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  breakdownLabel: {
    fontSize: 15,
    color: color.textSecondary,
  },
  breakdownVal: {
    fontSize: 15,
    fontWeight: '600',
    color: color.textPrimary,
  },
  netPayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  netPayLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.textPrimary,
  },
  netPayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.primaryDarkGold,
  },
});
