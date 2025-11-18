import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView 
      style={{
        flex: 1,
        paddingTop: insets.top,
      }}
      className="bg-background dark:bg-background-dark"
    >
      <View className="p-4">
        <ThemedText type="title" className="text-4xl font-bold text-text-primary dark:text-text-dark">
          Welcome Home!
        </ThemedText>
        <ThemedText className="text-lg text-text-secondary dark:text-text-dark-secondary">
          This is your dashboard.
        </ThemedText>
      </View>
      <View className="flex-row justify-around p-4">
        <Pressable
          onPress={() => router.push('/(home)/sensors')}
          className="bg-surface dark:bg-surface-dark p-4 rounded-lg flex-1 m-2 items-center"
        >
          <Ionicons name="hardware-chip-outline" size={48} color={Colors.light.tint} />
          <ThemedText className="text-lg font-bold mt-2 text-text-primary dark:text-text-dark">Sensors</ThemedText>
          <ThemedText className="text-center text-text-secondary dark:text-text-dark-secondary">
            Check your device's sensors
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(home)/places')}
          className="bg-surface dark:bg-surface-dark p-4 rounded-lg flex-1 m-2 items-center"
        >
          <Ionicons name="map-outline" size={48} color={Colors.light.tint} />
          <ThemedText className="text-lg font-bold mt-2 text-text-primary dark:text-text-dark">Places</ThemedText>
          <ThemedText className="text-center text-text-secondary dark:text-text-dark-secondary">
            Find nearby places
          </ThemedText>
        </Pressable>
         <Pressable
          onPress={() => router.push('/(home)/restaurant')}
          className="bg-surface dark:bg-surface-dark p-4 rounded-lg flex-1 m-2 items-center"
        >
          <Ionicons name="restaurant-outline" size={48} color={Colors.light.tint} />
          <ThemedText className="text-lg font-bold mt-2 text-text-primary dark:text-text-dark">Restaurants</ThemedText>
          <ThemedText className="text-center text-text-secondary dark:text-text-dark-secondary">
            Find nearby restaurants
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}