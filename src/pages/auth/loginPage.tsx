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
import { color } from '../../assets/colors/globalColor';
import { storageService, RegisteredUser } from '../../services/storageService';
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

  // UI status message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email helper validator
  const isValidEmail = (email: string) => {
    return (
      email.includes('@') &&
      email.includes('.') &&
      email.indexOf('@') > 0 &&
      email.lastIndexOf('.') > email.indexOf('@')
    );
  };

  const handleRegister = async () => {
    setMessage(null);
    if (!regEmpId.trim() || !regFullName.trim() || !regEmail.trim() || !regPassword) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!isValidEmail(regEmail.trim())) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address containing "@" (e.g. name@company.com).',
      });
      return;
    }

    if (regPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      // Check if employee already exists
      const existing = await storageService.getUserByEmployeeId(regEmpId);
      if (existing) {
        setMessage({ type: 'error', text: `Employee ID "${regEmpId}" is already registered!` });
        setLoading(false);
        return;
      }

      const newUser: RegisteredUser = {
        employeeId: regEmpId.trim().toUpperCase(),
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      };

      // Call POST API for registered employee & disk CSV sync
      const success = await authService.registerEmployee(newUser);
      if (success) {
        setMessage({
          type: 'success',
          text: 'Registration successful! Employee data saved & synced.',
        });
        setLoginEmpId(newUser.employeeId);
        setRegEmpId('');
        setRegFullName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setIsLoginTab(true);
      } else {
        setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setMessage(null);
    if (!loginEmpId.trim() || !loginPassword) {
      setMessage({ type: 'error', text: 'Please enter your Employee ID and Password.' });
      return;
    }

    if (loginPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);

    try {
      const user = await storageService.getUserByEmployeeId(loginEmpId);
      if (!user) {
        setMessage({
          type: 'error',
          text: `No account found for Employee ID "${loginEmpId}". Please register first.`,
        });
        setLoading(false);
        return;
      }

      if (user.password !== loginPassword) {
        setMessage({ type: 'error', text: 'Incorrect password. Please try again.' });
        setLoading(false);
        return;
      }

      await storageService.setSessionUser(user);
      onLoginSuccess(user);
    } catch (err) {
      setMessage({ type: 'error', text: 'Login failed. Please try again.' });
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
            onPress={() => {
              setIsLoginTab(true);
              setMessage(null);
            }}
          >
            <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, !isLoginTab && styles.activeTabButton]}
            onPress={() => {
              setIsLoginTab(false);
              setMessage(null);
            }}
          >
            <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Message */}
        {message && (
          <View
            style={[
              styles.messageBanner,
              message.type === 'error' ? styles.errorMessage : styles.successMessage,
            ]}
          >
            <Text
              style={
                message.type === 'error' ? styles.errorMessageText : styles.successMessageText
              }
            >
              {message.text}
            </Text>
          </View>
        )}

        {/* Form Container */}
        <View style={styles.card}>
          {isLoginTab ? (
            // --- LOGIN FORM ---
            <View>
              <Text style={styles.formHeading}>Welcome Back</Text>
              <Text style={styles.formSubheading}>Enter your credentials to access your portal</Text>

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
                  <Text style={styles.loadingText}>Authenticating employee...</Text>
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
              <Text style={styles.formSubheading}>Register your employee profile</Text>

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
                  <Text style={styles.loadingText}>Posting new employee registration...</Text>
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
  messageBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: color.accentRed,
  },
  errorMessageText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
  successMessage: {
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: color.success,
  },
  successMessageText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '500',
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
