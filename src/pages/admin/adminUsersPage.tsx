import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { CustomInput } from '../../components/common/CustomInput';
import { color } from '../../assets/colors/globalColor';
import { storageService, RegisteredUser } from '../../services/storageService';
import { databaseService } from '../../services/databaseService';

interface AdminUsersPageProps {
  onClose: () => void;
}

export default function AdminUsersPage({ onClose }: AdminUsersPageProps) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Form Fields
  const [formEmpId, setFormEmpId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');

  // Load all users from SQLite DB
  const loadUsers = async () => {
    setLoading(true);
    const list = await storageService.getAllUsers();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormEmpId('');
    setFormFullName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('EMPLOYEE');
    setIsEditing(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEditModal = (user: RegisteredUser) => {
    setFormEmpId(user.employeeId);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPassword(user.password || '');
    setFormRole(user.role || 'EMPLOYEE');
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleViewCSV = async () => {
    const rawCsv = await databaseService.getUsersCSVString();
    setCsvText(rawCsv);
    setShowCSVModal(true);
  };

  const handleSaveUser = async () => {
    if (!formEmpId.trim() || !formFullName.trim() || !formEmail.trim() || !formPassword.trim()) {
      Alert.alert('Validation Error', 'Please fill in all user fields.');
      return;
    }

    if (formPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    const userData: RegisteredUser = {
      employeeId: formEmpId.trim().toUpperCase(),
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      password: formPassword,
      role: formRole,
      createdAt: new Date().toISOString(),
    };

    if (isEditing) {
      await storageService.updateUser(userData);
      Alert.alert('Success', `User ${userData.employeeId} updated successfully.`);
    } else {
      const existing = await storageService.getUserByEmployeeId(userData.employeeId);
      if (existing) {
        Alert.alert('Error', `Employee ID ${userData.employeeId} already exists!`);
        return;
      }
      await storageService.registerUser(userData);
      Alert.alert('Success', `User ${userData.employeeId} registered and saved to CSV.`);
    }

    setShowFormModal(false);
    resetForm();
    loadUsers();
  };

  const handleDeleteUser = (empId: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete user ${empId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteUser(empId);
            loadUsers();
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>Admin Users & CSV Database</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {/* Action Header: Search & Add / CSV Buttons */}
        <View style={styles.actionHeaderRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, Name or Email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.csvButton} onPress={handleViewCSV}>
            <Text style={styles.csvButtonText}>📄 View CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.countText}>
          Total Registered Users: <Text style={{ fontWeight: 'bold', color: color.primaryDarkGold }}>{users.length}</Text>
          <Text style={{ fontStyle: 'italic', color: color.textSecondary }}> (Saved in src/data/registered_users.csv)</Text>
        </Text>

        {/* Users Table List */}
        <ScrollView style={styles.scrollList}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No registered users found.</Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.employeeId} style={styles.userCard}>
                <View style={styles.userCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.userName}>{user.fullName}</Text>
                      <Text style={styles.userEmpId}>{user.employeeId}</Text>
                    </View>
                  </View>
                  <View style={[styles.roleBadge, user.role === 'ADMIN' ? styles.roleAdmin : styles.roleEmp]}>
                    <Text style={[styles.roleBadgeText, user.role === 'ADMIN' ? styles.roleAdminText : styles.roleEmpText]}>
                      {user.role || 'EMPLOYEE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.userCardDivider} />

                <View style={styles.userDetailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailVal}>{user.email}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Text style={styles.detailLabel}>Password:</Text>
                  <Text style={styles.detailVal}>•••••••• ({user.password})</Text>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEditModal(user)}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit User</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteUser(user.employeeId)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* --- ADD / EDIT USER MODAL --- */}
      <Modal visible={showFormModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEditing ? `Edit User (${formEmpId})` : 'Add New Registered User'}
            </Text>

            <CustomInput
              label="Employee ID"
              placeholder="e.g. EMP1005"
              value={formEmpId}
              onChangeText={setFormEmpId}
              autoCapitalize="characters"
            />
            <CustomInput
              label="Full Name"
              placeholder="e.g. Sarah Jenkins"
              value={formFullName}
              onChangeText={setFormFullName}
              autoCapitalize="words"
            />
            <CustomInput
              label="Email Address"
              placeholder="e.g. sarah@intellect.com"
              value={formEmail}
              onChangeText={setFormEmail}
              keyboardType="email-address"
            />
            <CustomInput
              label="Password"
              placeholder="Enter password"
              value={formPassword}
              onChangeText={setFormPassword}
              secureTextEntry
            />

            {/* Role Picker */}
            <Text style={styles.rolePickerLabel}>Role</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleChip, formRole === 'EMPLOYEE' && styles.roleChipActive]}
                onPress={() => setFormRole('EMPLOYEE')}
              >
                <Text style={[styles.roleChipText, formRole === 'EMPLOYEE' && styles.roleChipTextActive]}>
                  EMPLOYEE
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleChip, formRole === 'ADMIN' && styles.roleChipActive]}
                onPress={() => setFormRole('ADMIN')}
              >
                <Text style={[styles.roleChipText, formRole === 'ADMIN' && styles.roleChipTextActive]}>
                  ADMIN
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowFormModal(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveUser}>
                <Text style={styles.saveModalBtnText}>
                  {isEditing ? 'Save Changes' : 'Create User'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- CSV VIEWER MODAL --- */}
      <Modal visible={showCSVModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.modalTitle}>📄 Registered Users CSV File</Text>
              <TouchableOpacity onPress={() => setShowCSVModal(false)}>
                <Text style={{ fontSize: 18, color: color.textSecondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: color.textSecondary, marginBottom: 8 }}>
              File path: src/data/registered_users.csv
            </Text>

            <ScrollView style={{ backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
              <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#1F2937' }}>
                {csvText}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveModalBtn, { marginTop: 16, alignItems: 'center' }]}
              onPress={() => setShowCSVModal(false)}
            >
              <Text style={styles.saveModalBtnText}>Close CSV Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    elevation: 3,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
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
  contentArea: {
    flex: 1,
    padding: 16,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: color.textPrimary,
    marginRight: 6,
  },
  csvButton: {
    backgroundColor: color.primaryLightGold,
    borderWidth: 1,
    borderColor: color.primaryGold,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 6,
  },
  csvButtonText: {
    color: color.primaryDarkGold,
    fontWeight: 'bold',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: color.primaryGold,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  countText: {
    fontSize: 12,
    color: color.textSecondary,
    marginBottom: 12,
  },
  scrollList: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: color.textSecondary,
    fontSize: 14,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.primaryLightGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: color.primaryDarkGold,
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.textPrimary,
  },
  userEmpId: {
    fontSize: 12,
    color: color.textSecondary,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  roleAdmin: {
    backgroundColor: '#FEE2E2',
  },
  roleAdminText: {
    color: color.accentRed,
  },
  roleEmp: {
    backgroundColor: '#E0E7FF',
  },
  roleEmpText: {
    color: '#3730A3',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userCardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  userDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: color.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textPrimary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: color.primaryLightGold,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  editBtnText: {
    color: color.primaryDarkGold,
    fontWeight: '700',
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: color.accentRed,
    fontWeight: '700',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 16,
  },
  rolePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: color.primaryLightGold,
    borderWidth: 1.5,
    borderColor: color.primaryGold,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textSecondary,
  },
  roleChipTextActive: {
    color: color.primaryDarkGold,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelModalBtnText: {
    color: color.textSecondary,
    fontWeight: '600',
  },
  saveModalBtn: {
    backgroundColor: color.primaryGold,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
