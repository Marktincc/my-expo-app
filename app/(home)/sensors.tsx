import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const SHAKE_THRESHOLD = 1.5;
const SHAKE_DEBOUNCE_TIME = 500; // milliseconds

export default function SensorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const lastShakeTime = useRef(0);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const subscription = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      const currentTime = Date.now();
      if (
        (Math.abs(x) > SHAKE_THRESHOLD ||
          Math.abs(y) > SHAKE_THRESHOLD ||
          Math.abs(z) > SHAKE_THRESHOLD) &&
        currentTime - lastShakeTime.current > SHAKE_DEBOUNCE_TIME
      ) {
        setFlashOn(prev => !prev);
        lastShakeTime.current = currentTime;
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content} className="items-center justify-center bg-background dark:bg-background-dark p-4">
          <ThemedText className="text-center mb-4">
            We need your permission to use the camera for the flashlight.
          </ThemedText>
          <Pressable
            onPress={requestPermission}
            className="bg-primary dark:bg-primary-dark py-2 px-4 rounded-lg"
          >
            <ThemedText className="text-white">Grant Permission</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content} className="items-center justify-center bg-background dark:bg-background-dark p-4">
        <CameraView
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
          enableTorch={flashOn}
        />

        <ThemedText type="title" className="mb-4 text-4xl font-bold text-text-primary dark:text-text-dark">
          Shake to Toggle
        </ThemedText>
        <Ionicons
          name={flashOn ? 'flashlight' : 'flashlight-outline'}
          size={128}
          color={flashOn ? Colors.light.tint : Colors.dark.icon}
          style={{ marginBottom: 20 }}
        />
        <View className="mb-4">
          <ThemedText className="text-lg text-text-secondary dark:text-text-dark-secondary">
            Flashlight is {flashOn ? 'On' : 'Off'}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => setFlashOn(!flashOn)}
          className="bg-primary dark:bg-primary-dark py-3 px-6 rounded-full"
        >
          <ThemedText className="text-white text-lg">Toggle Flashlight</ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});