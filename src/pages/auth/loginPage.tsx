import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { IntellectLogo } from '../../components/common/IntellectLogo';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { SwalAlert, SwalType } from '../../components/common/SwalAlert';
import { color } from '../../assets/colors/globalColor';
import { RegisteredUser } from '../../services/storageService';
import { authService } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: RegisteredUser) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmpId, setLoginEmpId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regEmpId, setRegEmpId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Swal Popup State
  const [swalState, setSwalState] = useState<{
    visible: boolean;
    type: SwalType;
    title: string;
    text: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'success',
    title: '',
    text: '',
  });

  const showSwal = (type: SwalType, title: string, text: string, onConfirm?: () => void) => {
    setSwalState({
      visible: true,
      type,
      title,
      text,
      onConfirm: () => {
        setSwalState((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
    });
  };

  const isValidEmail = (email: string) => {
    return (
      email.includes('@') &&
      email.includes('.') &&
      email.indexOf('@') > 0 &&
      email.lastIndexOf('.') > email.indexOf('@')
    );
  };

  // POST /api/register
  const handleRegister = async () => {
    if (!regEmpId.trim() || !regFullName.trim() || !regEmail.trim() || !regPassword) {
      showSwal('warning', 'Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(regEmail.trim())) {
      showSwal('error', 'Invalid Email', 'Please enter a valid email address containing "@" (e.g. name@company.com).');
      return;
    }

    if (regPassword.length < 6) {
      showSwal('warning', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showSwal('error', 'Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const newUser: RegisteredUser = {
        employeeId: regEmpId.trim().toUpperCase(),
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      };

      // Call POST /api/register API
      const result = await authService.registerEmployee(newUser);

      if (result.success) {
        setLoginEmpId(newUser.employeeId);
        setRegEmpId('');
        setRegFullName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setIsLoginTab(true);

        showSwal(
          'success',
          'Registration Successful!',
          `Employee ID "${newUser.employeeId}" has been registered via POST /api/register and saved to CSV.`
        );
      } else {
        showSwal('error', 'Registration Error', result.error || 'Failed to register employee.');
      }
    } catch (err) {
      showSwal('error', 'Error', 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // POST /api/login
  const handleLogin = async () => {
    if (!loginEmpId.trim() || !loginPassword) {
      showSwal('warning', 'Missing Credentials', 'Please enter your Employee ID and Password.');
      return;
    }

    if (loginPassword.length < 6) {
      showSwal('warning', 'Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Call POST /api/login API
      const result = await authService.loginEmployee({
        employeeId: loginEmpId.trim().toUpperCase(),
        password: loginPassword,
      });

      if (result.success && result.user) {
        const loggedUser = result.user;
        showSwal(
          'success',
          'Login Successful!',
          `Welcome back, ${loggedUser.fullName}! Redirecting to your dashboard...`,
          () => {
            onLoginSuccess(loggedUser);
          }
        );
      } else {
        showSwal('error', 'Authentication Error', result.error || 'Invalid credentials.');
      }
    } catch (err) {
      showSwal('error', 'Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Logo */}
        <View style={styles.headerSection}>
          <IntellectLogo scale={1} />
          <Text style={styles.portalTitle}>Employee Portal</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLoginTab && styles.activeTabButton]}
            onPress={() => setIsLoginTab(true)}
          >
            <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLoginTab && styles.activeTabButton]}
            onPress={() => setIsLoginTab(false)}
          >
            <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.card}>
          {isLoginTab ? (
            // --- LOGIN FORM ---
            <View>
              <Text style={styles.formHeading}>Welcome Back</Text>
              <Text style={styles.formSubheading}>Enter your credentials (API Authentication)</Text>

              <CustomInput
                label="Employee ID"
                placeholder="e.g. EMP1001"
                value={loginEmpId}
                onChangeText={setLoginEmpId}
                autoCapitalize="characters"
              />
              <CustomInput
                label="Password (min 6 chars)"
                placeholder="Enter your password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={color.primaryGold} />
                  <Text style={styles.loadingText}>Authenticating with API (POST /api/login)...</Text>
                </View>
              ) : (
                <CustomButton
                  title="Sign In"
                  onPress={handleLogin}
                  style={{ marginTop: 16 }}
                />
              )}
            </View>
          ) : (
            // --- REGISTER FORM ---
            <View>
              <Text style={styles.formHeading}>Create Account</Text>
              <Text style={styles.formSubheading}>Register profile (POST /api/register to CSV)</Text>

              <CustomInput
                label="Employee ID"
                placeholder="e.g. EMP1001"
                value={regEmpId}
                onChangeText={setRegEmpId}
                autoCapitalize="characters"
              />
              <CustomInput
                label="Full Name"
                placeholder="e.g. John Doe"
                value={regFullName}
                onChangeText={setRegFullName}
                autoCapitalize="words"
              />
              <CustomInput
                label="Corporate Email (must contain '@')"
                placeholder="e.g. john@intellect.com"
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
              />
              <CustomInput
                label="Password (min 6 chars)"
                placeholder="Create password (6+ chars)"
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
              />
              <CustomInput
                label="Confirm Password"
                placeholder="Re-enter password"
                value={regConfirmPassword}
                onChangeText={setRegConfirmPassword}
                secureTextEntry
              />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={color.primaryGold} />
                  <Text style={styles.loadingText}>Posting Registration (POST /api/register)...</Text>
                </View>
              ) : (
                <CustomButton
                  title="Register Employee"
                  onPress={handleRegister}
                  style={{ marginTop: 16 }}
                />
              )}
            </View>
          )}
        </View>

        {/* --- SWAL ALERT POPUP MODAL --- */}
        <SwalAlert
          visible={swalState.visible}
          type={swalState.type}
          title={swalState.title}
          text={swalState.text}
          onConfirm={swalState.onConfirm}
        />

        <Text style={styles.footerNote}>Intellect Design Arena • A Nihilent Company</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: color.background,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  portalTitle: {
    fontSize: 16,
    color: color.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: color.textSecondary,
  },
  activeTabText: {
    color: color.primaryDarkGold,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  formHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color.textPrimary,
    marginBottom: 4,
  },
  formSubheading: {
    fontSize: 14,
    color: color.textSecondary,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: color.primaryDarkGold,
    fontWeight: '600',
  },
  footerNote: {
    textAlign: 'center',
    color: color.textSecondary,
    fontSize: 12,
    marginTop: 24,
  },
});
