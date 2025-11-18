import React, { useState, useEffect } from 'react';
import { View, FlatList, Linking, Platform, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  vicinity: string;
  distance: number;
  type: string;
}

interface OSMElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
  };
}

interface OSMResponse {
  elements: OSMElement[];
}

export default function PlacesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(1500);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) fetchNearbyPlaces();
  }, [location, selectedRadius]);

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
      console.error(error);
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

  const fetchNearbyPlaces = async () => {
    if (!location) return;

    const { latitude, longitude } = location.coords;

    const query = `
      [out:json];
      (
        node["leisure"="park"](around:${selectedRadius},${latitude},${longitude});
        way["leisure"="park"](around:${selectedRadius},${latitude},${longitude});
        relation["leisure"="park"](around:${selectedRadius},${latitude},${longitude});
      );
      out center;
    `;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      
      const data: OSMResponse = await res.json();
      
      const formatted = data.elements
        .map(e => {
          const name = e.tags?.name || 'Parque sin nombre';
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
            vicinity: `Tipo: ${e.type}`,
            distance,
            type: 'park',
          };
        })
        .filter(Boolean) as Place[];

      formatted.sort((a, b) => a.distance - b.distance);
      setPlaces(formatted);
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al obtener lugares cercanos');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
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

  const getMarkerColor = (distance: number) => {
    if (distance < 0.5) return '#22c55e'; // Verde - muy cerca
    if (distance < 1) return '#eab308'; // Amarillo - cerca
    return '#ef4444'; // Rojo - lejos
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText className="mt-4 text-text-secondary dark:text-text-dark-secondary">
          Obteniendo ubicación...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{ flex: 1, paddingTop: insets.top }}
      className="bg-background dark:bg-background-dark"
    >
      {errorMsg && (
        <View className="p-4 bg-red-500">
          <ThemedText className="text-white text-center font-semibold">
            {errorMsg}
          </ThemedText>
        </View>
      )}

      {/* Controles de Radio */}
      <View className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ThemedText className="text-sm font-semibold mb-2 text-text-primary dark:text-text-dark">
          Radio de búsqueda
        </ThemedText>
        <View className="flex-row justify-around">
          {[500, 1000, 1500, 2000].map(radius => (
            <Pressable
              key={radius}
              onPress={() => setSelectedRadius(radius)}
              className={`px-4 py-2 rounded-full ${
                selectedRadius === radius
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <ThemedText
                className={`text-sm font-medium ${
                  selectedRadius === radius
                    ? 'text-white'
                    : 'text-text-secondary dark:text-text-dark-secondary'
                }`}
              >
                {radius}m
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Mapa */}
      <View style={{ height: '45%' }} className="relative">
        {location && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={false}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            {/* Círculo de radio de búsqueda */}
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

            {/* Marcador de ubicación actual en AZUL */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Mi Ubicación"
              description="Estás aquí"
              pinColor="#3b82f6"
            >
              <View className="items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center border-4 border-white shadow-lg">
                  <Ionicons name="person" size={24} color="white" />
                </View>
              </View>
            </Marker>

            {/* Marcadores de parques */}
            {places.map(place => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={`${place.distance.toFixed(2)} km`}
                pinColor={getMarkerColor(place.distance)}
              >
                <View className="items-center">
                  <View 
                    style={{ backgroundColor: getMarkerColor(place.distance) }}
                    className="w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-md"
                  >
                    <Ionicons name="leaf" size={20} color="white" />
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Badge con contador de lugares */}
        <View className="absolute top-3 left-3 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg">
          <ThemedText className="text-sm font-bold text-text-primary dark:text-text-dark">
            {places.length} parques encontrados
          </ThemedText>
        </View>
      </View>

      {/* Lista de lugares */}
      <FlatList
        data={places}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="p-8 items-center">
            <Ionicons name="search-outline" size={48} color={Colors.light.tint} />
            <ThemedText className="mt-4 text-center text-text-secondary dark:text-text-dark-secondary">
              No se encontraron parques cerca.{'\n'}Intenta aumentar el radio de búsqueda.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openInMaps(item.latitude, item.longitude, item.name)}
            className="p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-800"
          >
            <View className="flex-row items-start">
              <View 
                style={{ backgroundColor: getMarkerColor(item.distance) }}
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="leaf" size={24} color="white" />
              </View>
              
              <View className="flex-1">
                <ThemedText className="text-lg font-bold text-text-primary dark:text-text-dark">
                  {item.name}
                </ThemedText>

                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={14} color={Colors.light.tint} />
                  <ThemedText className="ml-1 text-sm text-text-secondary dark:text-text-dark-secondary">
                    {item.distance < 1 
                      ? `${(item.distance * 1000).toFixed(0)} metros`
                      : `${item.distance.toFixed(2)} km`
                    }
                  </ThemedText>
                </View>

                <View className="mt-2 flex-row items-center">
                  <Ionicons name="map-outline" size={16} color={Colors.light.tint} />
                  <ThemedText className="ml-2 text-primary dark:text-primary-dark font-medium">
                    Abrir en Mapas
                  </ThemedText>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={Colors.light.tint} />
            </View>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}