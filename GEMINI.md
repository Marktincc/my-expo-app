# Gemini Context: my-expo-app

## 🩺 Project Overview

**my-expo-app** is a cross-platform health-focused mobile application built with **React Native** and **Expo**, written in **TypeScript**, and styled using **Tailwind CSS v4** via the **NativeWind** library.

The app uses **Expo Router** for file-based navigation and provides a smooth authentication flow (`login` and `register`) leading into a **main tabbed interface** that includes:
- 🏠 **Home**
- 📋 **Form**
- 🔍 **Explore**

The project is designed for **Android**, **iOS**, and **Web**, maintaining visual and functional consistency across all platforms.

---

## 🧩 Key Technologies

| Category | Technology |
|-----------|-------------|
| **Framework** | Expo / React Native |
| **Language** | TypeScript |
| **Navigation** | Expo Router |
| **Styling** | Tailwind CSS v4 + NativeWind |
| **UI Components** | Custom themed components (`ThemedText`, `ThemedView`) |
| **Icons** | @expo/vector-icons |
| **Safe Areas** | react-native-safe-area-context |

---

## 🖌️ Design System — “Vital Balance”

This palette is optimized for **health and wellness** applications, transmitting calm, trust, and balance.

### 🎨 Color Tokens

| Role | Variable | Hex | Description |
|------|-----------|------|-------------|
| **Primary** | `--color-primary` | `#4FB3BF` | Calm teal — confidence & clarity |
| **Primary Dark** | `--color-primary-dark` | `#3A8A94` | Used for hover / pressed states |
| **Secondary** | `--color-secondary` | `#6FCF97` | Health & balance green |
| **Accent** | `--color-accent` | `#2F80ED` | Calls to action or highlights |
| **Background** | `--color-background` | `#F7F9FA` | Soft white background |
| **Surface** | `--color-surface` | `#FFFFFF` | Cards / containers |
| **Text Primary** | `--color-text-primary` | `#333333` | Main readable text |
| **Text Secondary** | `--color-text-secondary` | `#828282` | Supporting text |
| **Success** | `--color-success` | `#27AE60` | Positive actions or confirmations |
| **Error** | `--color-error` | `#EB5757` | Errors or critical alerts |

### 🌙 Dark Mode

| Role | Variable | Hex |
|------|-----------|-----|
| **Background** | `--color-background` | `#121212` |
| **Surface** | `--color-surface` | `#1E1E1E` |
| **Text Primary** | `--color-text-primary` | `#E0E0E0` |
| **Text Secondary** | `--color-text-secondary` | `#B0B0B0` |

> Defined in `global.css` using the `@theme` directive from Tailwind v4.

---

## ⚙️ Build & Run Commands

| Command | Description |
|----------|-------------|
| `npm start` / `npx expo start` | Launch Expo development server |
| `npm run android` | Run the app on Android device/emulator |
| `npm run ios` | Run the app on iOS simulator |
| `npm run web` | Run web version |
| `npm run lint` | Check TypeScript and ESLint rules |
| `npm run format` | Apply Prettier formatting |
| `npm run reset-project` | Clean cache and reinstall dependencies |

---

## 📁 Project Structure

