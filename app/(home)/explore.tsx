
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExploreScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <ThemedText type="title" className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">Explore</ThemedText>
      <ThemedText className="text-lg text-gray-600 dark:text-gray-400">This is the explore screen.</ThemedText>
    </ThemedView>
  );
}
