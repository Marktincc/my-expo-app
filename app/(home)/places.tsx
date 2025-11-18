import React, { useState, useEffect } from 'react';
import { View, FlatList, Linking, Platform, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const fetchNearbyPlaces = () => {
    if (!location) return;

    const { latitude, longitude } = location.coords;
    const radius = 1500; // in meters

    const query = `
      [out:json];
      (
        node["leisure"="park"](around:${radius},${latitude},${longitude});
        way["leisure"="park"](around:${radius},${latitude},${longitude});
        relation["leisure"="park"](around:${radius},${latitude},${longitude});
      );
      out center;
    `;

    const url = 'https://overpass-api.de/api/interpreter';

    fetch(url, {
      method: 'POST',
      body: query,
    })
      .then(response => response.json())
      .then((data: OSMResponse) => {
        const formattedPlaces = data.elements.map((element: OSMElement) => {
          const name = element.tags?.name || 'Unnamed Park';
          let lat: number, lon: number;
          if (element.type === 'node' && element.lat && element.lon) {
            lat = element.lat;
            lon = element.lon;
          } else if (element.center) {
            lat = element.center.lat;
            lon = element.center.lon;
          } else {
            return null;
          }
          const distance = getDistance(latitude, longitude, lat, lon);
          return {
            id: element.id,
            name,
            latitude: lat,
            longitude: lon,
            vicinity: `Type: ${element.type}`,
            distance,
          };
        }).filter((place): place is Place => place !== null);

        formattedPlaces.sort((a, b) => a.distance - b.distance);

        setPlaces(formattedPlaces);
      })
      .catch((error: Error) => {
        setErrorMsg('Error fetching nearby places from OpenStreetMap.');
        console.error(error);
      });
  };

  const openInMaps = (lat: number, lng: number): void => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = 'Custom Label';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ThemedView 
      style={{
        flex: 1,
        paddingTop: insets.top,
      }}
      className="bg-background dark:bg-background-dark"
    >
      {errorMsg && (
        <View className="p-4 bg-red-500">
          <ThemedText className="text-white text-center">{errorMsg}</ThemedText>
        </View>
      )}
      <View style={{ height: '50%' }}>
        {location && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="My Location"
              pinColor={Colors.light.tint}
            />
            {places.map(place => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={`${place.vicinity} - ${place.distance.toFixed(2)} km`}
              />
            ))}
          </MapView>
        )}
      </View>
      <FlatList
        data={places}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => openInMaps(item.latitude, item.longitude)}
            className="p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-800"
          >
            <ThemedText className="text-lg font-bold text-text-primary dark:text-text-dark">
              {item.name}
            </ThemedText>
            <ThemedText className="text-text-secondary dark:text-text-dark-secondary">
              {item.vicinity}
            </ThemedText>
            <ThemedText className="text-text-secondary dark:text-text-dark-secondary">
              {item.distance.toFixed(2)} km away
            </ThemedText>
            <View className="mt-2 flex-row items-center">
              <Ionicons name="map-outline" size={16} color={Colors.light.tint} />
              <ThemedText className="ml-2 text-primary dark:text-primary-dark">
                Open in Maps
              </ThemedText>
            </View>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}