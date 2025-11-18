import { getAuth } from "firebase/auth";
import { app } from "../../firebase.config";
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";


export default function SignOut() {
    const auth = getAuth(app);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            console.log('User signed out successfully');
            router.replace('/login');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
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
            <Text className="text-3xl font-bold text-center mb-2 text-text-primary-light dark:text-text-primary-dark">
              You have been signed out.
            </Text>
            <TouchableOpacity
              className="w-full h-14 rounded-xl bg-primary items-center justify-center active:bg-primary-dark"
              onPress={handleSignOut}
            >
              <Text className="text-white font-semibold">Go to Login</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView> 
  )
} 