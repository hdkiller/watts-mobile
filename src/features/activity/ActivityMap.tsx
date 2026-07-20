import { useEffect, useRef, useState } from 'react';
import { Platform, Text, useColorScheme, View } from 'react-native';

import { GOOGLE_MAPS_API_KEY } from '@/src/config/env';
import { Colors } from '@/src/theme/colors';

let MapView: any;
let Polyline: any;
let Marker: any;

try {
  const MapsModule = require('react-native-maps');
  MapView = MapsModule.default || MapsModule.MapView;
  Polyline = MapsModule.Polyline;
  Marker = MapsModule.Marker;
} catch {
  // Graceful fallback if native module is not compiled yet
}

type Props = {
  coordinates: { latitude: number; longitude: number }[];
};

function MapUnavailable({ message }: { message: string }) {
  return (
    <View className="mt-6 h-[200px] w-full items-center justify-center rounded-xl border border-border bg-card/40 p-4">
      <Text className="text-sm font-medium text-red-400">Route map preview unavailable</Text>
      <Text className="mt-1 text-center text-xs text-text-muted">{message}</Text>
    </View>
  );
}

export function ActivityMap({ coordinates }: Props) {
  const colorScheme = useColorScheme();
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mapReady && mapRef.current && coordinates.length > 0) {
      // Small timeout to ensure Android rendering is ready to fit bounds
      const timer = setTimeout(() => {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 30, right: 30, bottom: 30, left: 30 },
          animated: false,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [coordinates, mapReady]);

  if (coordinates.length === 0) {
    return null;
  }

  if (!MapView || !Polyline || !Marker) {
    return (
      <MapUnavailable message="A native binary rebuild is required to link map modules." />
    );
  }

  // Google Maps SDK crashes on attach when the Android manifest key is missing.
  if (Platform.OS === 'android' && !GOOGLE_MAPS_API_KEY) {
    return (
      <MapUnavailable message="Set GOOGLE_MAPS_API_KEY in .env and rebuild the Android binary." />
    );
  }

  // Calculate bounding box for initialRegion fallback
  const lats = coordinates.map((c) => c.latitude);
  const lngs = coordinates.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const initialRegion = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.3, 0.005),
    longitudeDelta: Math.max((maxLng - minLng) * 1.3, 0.005),
  };

  const startPoint = coordinates[0];
  const endPoint = coordinates[coordinates.length - 1];

  return (
    <View className="mt-6">
      <Text className="text-xs uppercase tracking-wide text-text-muted mb-3">Route Map</Text>
      <View className="h-[200px] w-full overflow-hidden rounded-xl border border-border bg-card/50">
        <MapView
          ref={mapRef}
          className="h-full w-full"
          userInterfaceStyle={colorScheme === 'light' ? 'light' : 'dark'}
          initialRegion={initialRegion}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Polyline
            coordinates={coordinates}
            strokeColor={Colors.brand}
            strokeWidth={3}
          />
          {startPoint ? (
            <Marker
              coordinate={startPoint}
              title="Start"
              pinColor="green"
            />
          ) : null}
          {endPoint ? (
            <Marker
              coordinate={endPoint}
              title="End"
              pinColor="red"
            />
          ) : null}
        </MapView>
      </View>
    </View>
  );
}
