import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase.config';

export default function LoginScreen() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const auth = getAuth(app);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);
      router.replace('/(home)');
    } catch (error) {
      console.error('Login error:', error);
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
          <View className="w-full max-w-md items-center">
            {/* App Logo */}
            <View className="mb-8 h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
              <MaterialIcons name="lock" size={40} color="#4FB3BF" />
            </View>

            {/* Headline */}
            <Text className="text-3xl font-bold text-center mb-2 text-text-primary-light dark:text-text-primary-dark">
              Welcome Back!
            </Text>

            <Text className="text-base text-center mb-8 text-text-secondary-light dark:text-text-secondary-dark">
              Log in to your account to continue
            </Text>

            {/* Email Input */}
            <View className="w-full mb-4">
              <Text className="text-sm font-medium mb-2 text-text-secondary-light dark:text-text-secondary-dark">
                Email Address
              </Text>
              <TextInput
                className={`w-full h-14 rounded-xl border-2 bg-surface-light dark:bg-surface-dark px-4 text-base text-text-primary-light dark:text-text-primary-dark outline-none ${
                  emailFocused ? 'border-primary' : 'border-border-light dark:border-border-dark'
                }`}
                placeholder="Enter your email"
                placeholderTextColor="#828282"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View className="w-full mb-3">
              <Text className="text-sm font-medium mb-2 text-text-secondary-light dark:text-text-secondary-dark">
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

            {/* Forgot Password */}
            <View className="w-full mb-6">
              <TouchableOpacity>
                <Text className="text-sm font-medium text-accent text-right">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Log In Button */}
            <TouchableOpacity
              className="h-14 w-full items-center justify-center rounded-xl bg-primary active:bg-primary-dark"
              onPress={handleLogin}
            >
              <Text className="text-white text-base font-bold">Log In</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="mt-8 items-center">
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Don't have an account?{' '}
                  <Text className="font-bold text-accent">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}