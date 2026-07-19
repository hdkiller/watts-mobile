import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Colors } from '@/src/theme/colors';

let MapView: any;
let Polyline: any;
let Marker: any;

try {
  const MapsModule = require('react-native-maps');
  MapView = MapsModule.default || MapsModule.MapView;
  Polyline = MapsModule.Polyline;
  Marker = MapsModule.Marker;
} catch (e) {
  // Graceful fallback if native module is not compiled yet
}

type Props = {
  coordinates: { latitude: number; longitude: number }[];
};

export function ActivityMap({ coordinates }: Props) {
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
      <View className="mt-6 h-[200px] w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <Text className="text-sm font-medium text-red-400">Route map preview unavailable</Text>
        <Text className="mt-1 text-center text-xs text-ink-muted">
          A native binary rebuild is required to link map modules.
        </Text>
      </View>
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
      <Text className="text-xs uppercase tracking-wide text-ink-muted mb-3">Route Map</Text>
      <View className="h-[200px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
        <MapView
          ref={mapRef}
          className="h-full w-full"
          userInterfaceStyle="dark"
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
