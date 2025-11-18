import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';
import { app } from '../firebase.config';

export default function RegisterScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const auth = getAuth(app);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const confirmPasswordsMatch = () => {
    return password === confirmPassword;
  };

  const handleRegister = async () => {
    if (!confirmPasswordsMatch()) {
      console.error('Passwords do not match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User registered:', user);
      router.replace('/(home)');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-6 py-10">
          <View className="w-full max-w-md">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="mb-4">
                <MaterialIcons name="shield" size={48} color="#4FB3BF" />
              </View>
              <Text className="text-3xl font-bold text-center text-text-primary-light dark:text-text-primary-dark">
                Create Your Account
              </Text>
              <Text className="text-base text-center mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                Let's get you started with a new account.
              </Text>
            </View>

            {/* Email */}
            <View className="w-full mb-4">
              <Text className="text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
                Email
              </Text>
              <TextInput
                className={`w-full h-14 rounded-xl border-2 bg-surface-light dark:bg-surface-dark px-4 text-base text-text-primary-light dark:text-text-primary-dark outline-none ${
                  emailFocused ? 'border-primary' : 'border-border-light dark:border-border-dark'
                }`}
                placeholder="Enter your email address"
                placeholderTextColor="#828282"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View className="w-full mb-4">
              <Text className="text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
                Password
              </Text>
              <View className="relative w-full">
                <TextInput
                  className={`w-full h-14 rounded-xl border-2 bg-surface-light dark:bg-surface-dark px-4 pr-12 text-base text-text-primary-light dark:text-text-primary-dark outline-none ${
                    passwordFocused ? 'border-primary' : 'border-border-light dark:border-border-dark'
                  }`}
                  placeholder="Enter your password"
                  placeholderTextColor="#828282"
                  secureTextEntry={!passwordVisible}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-4 top-4"
                >
                  <MaterialIcons
                    name={passwordVisible ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#828282"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="w-full mb-6">
              <Text className="text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
                Confirm Password
              </Text>
              <View className="relative w-full">
                <TextInput
                  className={`w-full h-14 rounded-xl border-2 bg-surface-light dark:bg-surface-dark px-4 pr-12 text-base text-text-primary-light dark:text-text-primary-dark outline-none ${
                    confirmPasswordFocused ? 'border-primary' : 'border-border-light dark:border-border-dark'
                  }`}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#828282"
                  secureTextEntry={!confirmPasswordVisible}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  className="absolute right-4 top-4"
                >
                  <MaterialIcons
                    name={confirmPasswordVisible ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#828282"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className="w-full h-14 rounded-xl bg-primary items-center justify-center active:bg-primary-dark"
              onPress={handleRegister}
            >
              <Text className="text-white font-bold text-base">Register</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="items-center mt-8">
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Already have an account?{' '}
                  <Text className="font-bold text-accent">Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}