import React, { useState, useEffect } from 'react';
import { View, FlatList, Linking, Platform, Pressable, ActivityIndicator, RefreshControl, Modal, TextInput, ScrollView } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Restaurant {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  vicinity: string;
  distance: number;
  cuisine?: string;
}

interface RestaurantVisit {
  restaurantId: number;
  restaurantName: string;
  visited: boolean;
  rating?: number;
  opinion?: string;
  isFavorite: boolean;
  visitDate?: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
}

interface OSMElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    cuisine?: string;
    amenity?: string;
  };
}

export default function RestaurantsScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [visits, setVisits] = useState<Map<number, RestaurantVisit>>(new Map());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(2000);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentOpinion, setCurrentOpinion] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'visited'>('map');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadVisits();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) fetchNearbyRestaurants();
  }, [location, selectedRadius]);

  const loadVisits = async () => {
    try {
      const stored = await AsyncStorage.getItem('restaurant_visits');
      if (stored) {
        const parsed = JSON.parse(stored);
        const map = new Map(Object.entries(parsed).map(([k, v]) => [Number(k), v as RestaurantVisit]));
        setVisits(map);
      }
    } catch (error) {
      console.error('Error loading visits:', error);
    }
  };

  const saveVisits = async (newVisits: Map<number, RestaurantVisit>) => {
    try {
      const obj = Object.fromEntries(newVisits);
      await AsyncStorage.setItem('restaurant_visits', JSON.stringify(obj));
      setVisits(newVisits);
    } catch (error) {
      console.error('Error saving visits:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Error al obtener ubicación');
    } finally {
      setLoading(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const fetchNearbyRestaurants = async () => {
    if (!location) return;

    const { latitude, longitude } = location.coords;

    const query = `
      [out:json];
      (
        node["amenity"="restaurant"](around:${selectedRadius},${latitude},${longitude});
        way["amenity"="restaurant"](around:${selectedRadius},${latitude},${longitude});
        node["amenity"="cafe"](around:${selectedRadius},${latitude},${longitude});
        way["amenity"="cafe"](around:${selectedRadius},${latitude},${longitude});
        node["amenity"="fast_food"](around:${selectedRadius},${latitude},${longitude});
        way["amenity"="fast_food"](around:${selectedRadius},${latitude},${longitude});
      );
      out center;
    `;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      
      const data = await res.json();
      
      const formatted = data.elements
        .map((e: OSMElement) => {
          const name = e.tags?.name || 'Restaurante sin nombre';
          let lat, lon;

          if (e.type === 'node' && e.lat && e.lon) {
            lat = e.lat;
            lon = e.lon;
          } else if (e.center) {
            lat = e.center.lat;
            lon = e.center.lon;
          } else return null;

          const distance = getDistance(latitude, longitude, lat, lon);

          return {
            id: e.id,
            name,
            latitude: lat,
            longitude: lon,
            vicinity: e.tags?.amenity || 'restaurant',
            distance,
            cuisine: e.tags?.cuisine,
          };
        })
        .filter(Boolean) as Restaurant[];

      formatted.sort((a, b) => a.distance - b.distance);
      setRestaurants(formatted);
    } catch (err) {
      setErrorMsg('Error al obtener restaurantes');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
  };

  const openReviewModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    const existingVisit = visits.get(restaurant.id);
    setCurrentRating(existingVisit?.rating || 0);
    setCurrentOpinion(existingVisit?.opinion || '');
    setCurrentPhone(existingVisit?.phoneNumber || '');
    setModalVisible(true);
  };

  const saveReview = () => {
    if (!selectedRestaurant) return;

    const newVisits = new Map(visits);
    newVisits.set(selectedRestaurant.id, {
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      visited: true,
      rating: currentRating,
      opinion: currentOpinion,
      phoneNumber: currentPhone,
      isFavorite: visits.get(selectedRestaurant.id)?.isFavorite || false,
      visitDate: new Date().toISOString(),
      latitude: selectedRestaurant.latitude,
      longitude: selectedRestaurant.longitude,
    });

    saveVisits(newVisits);
    setModalVisible(false);
    setSelectedRestaurant(null);
    setCurrentRating(0);
    setCurrentOpinion('');
    setCurrentPhone('');
  };

  const toggleFavorite = (restaurantId: number, restaurant: Restaurant) => {
    const newVisits = new Map(visits);
    const existing = visits.get(restaurantId);

    if (existing) {
      newVisits.set(restaurantId, { ...existing, isFavorite: !existing.isFavorite });
    } else {
      newVisits.set(restaurantId, {
        restaurantId,
        restaurantName: restaurant.name,
        visited: false,
        isFavorite: true,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      });
    }

    saveVisits(newVisits);
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${name}@${latLng}`,
      android: `${scheme}${latLng}(${name})`,
    });

    if (url) Linking.openURL(url);
  };

  const callRestaurant = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const getMarkerColor = (restaurantId: number, distance: number) => {
    const visit = visits.get(restaurantId);
    if (visit?.isFavorite) return '#f59e0b'; // Dorado - favorito
    if (visit?.visited) return '#8b5cf6'; // Morado - visitado
    if (distance < 0.5) return '#22c55e'; // Verde - cerca
    return '#ef4444'; // Rojo - lejos
  };

  const getVisitedRestaurants = () => {
    return Array.from(visits.values())
      .filter(v => v.visited)
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.visitDate || 0).getTime() - new Date(a.visitDate || 0).getTime();
      });
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText className="mt-4">Obteniendo ubicación...</ThemedText>
      </ThemedView>
    );
  }

  const renderMapTab = () => (
    <>
      {errorMsg && (
        <View className="p-4 bg-red-500">
          <ThemedText className="text-white text-center font-semibold">{errorMsg}</ThemedText>
        </View>
      )}

      <View className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ThemedText className="text-sm font-semibold mb-2">Radio de búsqueda</ThemedText>
        <View className="flex-row justify-around">
          {[1000, 2000, 3000, 5000].map(radius => (
            <Pressable
              key={radius}
              onPress={() => setSelectedRadius(radius)}
              className={`px-4 py-2 rounded-full ${
                selectedRadius === radius ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <ThemedText className={selectedRadius === radius ? 'text-white' : ''}>
                {radius}m
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: '45%' }} className="relative">
        {location && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={false}
          >
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={selectedRadius}
              fillColor="rgba(59, 130, 246, 0.1)"
              strokeColor="rgba(59, 130, 246, 0.5)"
              strokeWidth={2}
            />

            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Mi Ubicación"
              pinColor="#3b82f6"
            >
              <View className="items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center border-4 border-white shadow-lg">
                  <Ionicons name="person" size={24} color="white" />
                </View>
              </View>
            </Marker>

            {restaurants.map(restaurant => (
              <Marker
                key={restaurant.id}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                }}
                title={restaurant.name}
                description={`${restaurant.distance.toFixed(2)} km`}
                onCalloutPress={() => openReviewModal(restaurant)}
              >
                <View className="items-center">
                  <View 
                    style={{ backgroundColor: getMarkerColor(restaurant.id, restaurant.distance) }}
                    className="w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-md"
                  >
                    <Ionicons 
                      name={visits.get(restaurant.id)?.isFavorite ? "star" : "restaurant"} 
                      size={20} 
                      color="white" 
                    />
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        <View className="absolute top-3 left-3 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg">
          <ThemedText className="text-sm font-bold">
            {restaurants.length} restaurantes
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const visit = visits.get(item.id);
          return (
            <Pressable
              onPress={() => openReviewModal(item)}
              className="p-4 border-b border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-start">
                <View 
                  style={{ backgroundColor: getMarkerColor(item.id, item.distance) }}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons 
                    name={visit?.isFavorite ? "star" : "restaurant"} 
                    size={24} 
                    color="white" 
                  />
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <ThemedText className="text-lg font-bold flex-1">{item.name}</ThemedText>
                    <Pressable onPress={() => toggleFavorite(item.id, item)} className="p-2">
                      <Ionicons 
                        name={visit?.isFavorite ? "heart" : "heart-outline"} 
                        size={24} 
                        color={visit?.isFavorite ? "#ef4444" : Colors.light.tint} 
                      />
                    </Pressable>
                  </View>

                  {visit?.visited && (
                    <View className="flex-row items-center mt-1">
                      {[1,2,3,4,5].map(star => (
                        <Ionicons 
                          key={star}
                          name={star <= (visit.rating || 0) ? "star" : "star-outline"}
                          size={16}
                          color="#fbbf24"
                        />
                      ))}
                      <ThemedText className="ml-2 text-sm text-green-600 dark:text-green-400">
                        ✓ Visitado
                      </ThemedText>
                    </View>
                  )}

                  {visit?.phoneNumber && (
                    <Pressable 
                      onPress={() => callRestaurant(visit.phoneNumber!)}
                      className="flex-row items-center mt-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg self-start"
                    >
                      <Ionicons name="call" size={16} color="#22c55e" />
                      <ThemedText className="ml-2 text-green-600 dark:text-green-400 font-medium">
                        {visit.phoneNumber}
                      </ThemedText>
                    </Pressable>
                  )}

                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={14} color={Colors.light.tint} />
                    <ThemedText className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                      {item.distance < 1 
                        ? `${(item.distance * 1000).toFixed(0)} metros`
                        : `${item.distance.toFixed(2)} km`
                      }
                    </ThemedText>
                  </View>

                  <Pressable 
                    onPress={() => openInMaps(item.latitude, item.longitude, item.name)}
                    className="mt-2 flex-row items-center"
                  >
                    <Ionicons name="map-outline" size={16} color={Colors.light.tint} />
                    <ThemedText className="ml-2 text-blue-500 font-medium">
                      Abrir en Mapas
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </>
  );

  const renderVisitedTab = () => {
    const visitedRestaurants = getVisitedRestaurants();

    return (
      <FlatList
        data={visitedRestaurants}
        keyExtractor={item => item.restaurantId.toString()}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <Ionicons name="restaurant-outline" size={64} color={Colors.light.tint} />
            <ThemedText className="mt-4 text-center text-gray-600 dark:text-gray-400">
              Aún no has visitado ningún restaurante.{'\n'}¡Empieza a explorar!
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  {item.isFavorite && (
                    <Ionicons name="star" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
                  )}
                  <ThemedText className="text-lg font-bold flex-1">{item.restaurantName}</ThemedText>
                </View>

                <View className="flex-row items-center mt-2">
                  {[1,2,3,4,5].map(star => (
                    <Ionicons 
                      key={star}
                      name={star <= (item.rating || 0) ? "star" : "star-outline"}
                      size={20}
                      color="#fbbf24"
                    />
                  ))}
                </View>

                {item.opinion && (
                  <ThemedText className="mt-2 text-gray-700 dark:text-gray-300 italic">
                    "{item.opinion}"
                  </ThemedText>
                )}

                {item.visitDate && (
                  <ThemedText className="mt-2 text-xs text-gray-500">
                    Visitado: {new Date(item.visitDate).toLocaleDateString('es')}
                  </ThemedText>
                )}

                {item.phoneNumber && (
                  <Pressable 
                    onPress={() => callRestaurant(item.phoneNumber!)}
                    className="flex-row items-center mt-3 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg self-start"
                  >
                    <Ionicons name="call" size={18} color="#22c55e" />
                    <ThemedText className="ml-2 text-green-600 dark:text-green-400 font-medium">
                      Llamar: {item.phoneNumber}
                    </ThemedText>
                  </Pressable>
                )}

                <Pressable 
                  onPress={() => openInMaps(item.latitude, item.longitude, item.restaurantName)}
                  className="mt-3 flex-row items-center"
                >
                  <Ionicons name="map-outline" size={16} color={Colors.light.tint} />
                  <ThemedText className="ml-2 text-blue-500 font-medium">
                    Ver en mapa
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }} className="bg-background dark:bg-background-dark">
      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Pressable
          onPress={() => setActiveTab('map')}
          className={`flex-1 py-4 items-center ${activeTab === 'map' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Ionicons name="map" size={24} color={activeTab === 'map' ? Colors.light.tint : '#9ca3af'} />
          <ThemedText className={`mt-1 ${activeTab === 'map' ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>
            Explorar
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('visited')}
          className={`flex-1 py-4 items-center ${activeTab === 'visited' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Ionicons name="checkmark-circle" size={24} color={activeTab === 'visited' ? Colors.light.tint : '#9ca3af'} />
          <ThemedText className={`mt-1 ${activeTab === 'visited' ? 'text-blue-500 font-bold' : 'text-gray-500'}`}>
            Visitados
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === 'map' ? renderMapTab() : renderVisitedTab()}

      {/* Modal de Review */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <ScrollView>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText className="text-2xl font-bold">{selectedRestaurant?.name}</ThemedText>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color={Colors.light.tint} />
                </Pressable>
              </View>

              <ThemedText className="text-lg font-semibold mb-3">Calificación</ThemedText>
              <View className="flex-row justify-center mb-6">
                {[1,2,3,4,5].map(star => (
                  <Pressable key={star} onPress={() => setCurrentRating(star)} className="mx-1">
                    <Ionicons 
                      name={star <= currentRating ? "star" : "star-outline"}
                      size={40}
                      color="#fbbf24"
                    />
                  </Pressable>
                ))}
              </View>

              <ThemedText className="text-lg font-semibold mb-3">Tu opinión</ThemedText>
              <TextInput
                value={currentOpinion}
                onChangeText={setCurrentOpinion}
                placeholder="¿Qué te pareció la comida?"
                multiline
                numberOfLines={4}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 text-base"
                style={{ textAlignVertical: 'top' }}
              />

              <ThemedText className="text-lg font-semibold mb-3">Teléfono de domicilios</ThemedText>
              <TextInput
                value={currentPhone}
                onChangeText={setCurrentPhone}
                placeholder="Ej: 3001234567"
                keyboardType="phone-pad"
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-6 text-base"
              />

              <Pressable
                onPress={saveReview}
                className="bg-blue-500 py-4 rounded-lg items-center"
                disabled={currentRating === 0}
              >
                <ThemedText className="text-white font-bold text-lg">
                  Guardar Visita
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}