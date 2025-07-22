import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Platform,
  ViewStyle,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Colors } from 'react-native-ui-lib';
import { WebView } from 'react-native-webview';

type Coords = { latitude: number; longitude: number };
type MapComponentProps = {
  cep?: string;
  coords?: Coords;
  width?: number;
  height?: number;
  style?: ViewStyle;
};

const PADDING = 16;
const DELTA = 0.005;

const MapComponent: React.FC<MapComponentProps> = ({
  cep,
  coords: initialCoords,
  width,
  height = 150,
  style,
}) => {
  const screenW = Dimensions.get('window').width;
  const mapW = width ?? screenW - PADDING * 2;
  const mapH = height;

  const [coords, setCoords] = useState<Coords | null>(initialCoords || null);
  const [loading, setLoading] = useState<boolean>(!!cep && !initialCoords);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    if (cep && !initialCoords) {
      setLoading(true);

      const endpoint =
        `https://geocode.maps.co/search` +
        `?q=${encodeURIComponent(cep)}` +
        `&limit=1`;

      fetch(endpoint)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setCoords({
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
            });
          } else {
            setError('CEP não encontrado');
          }
        })
        .catch(err => {
          console.error('geocode.maps.co error', err);
          setError('Erro ao buscar localização');
        })
        .finally(() => setLoading(false));
    }
  }, [cep]);



  if (loading) {
    return (
      <View style={[styles.loader, { width: mapW, height: mapH }, style]}>
        <ActivityIndicator size="small" color={Colors.blue30} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.loader, { width: mapW, height: mapH }, style]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!coords) {
    return (
      <View style={[styles.loader, { width: mapW, height: mapH }, style]}>
        <Text style={styles.error}>Localização indisponível</Text>
      </View>
    );
  }

  const { latitude, longitude } = coords;
  const minLat = latitude - DELTA;
  const maxLat = latitude + DELTA;
  const minLon = longitude - DELTA;
  const maxLon = longitude + DELTA;

  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${minLon},${minLat},${maxLon},${maxLat}` +
    `&layer=mapnik&marker=${latitude},${longitude}`;

  if (Platform.OS === 'web') {
    // web: <iframe> dentro de um div com style -> evita array e infinite loop
    return (
      <div
        style={{
          width: mapW,
          height: mapH,
          overflow: 'hidden',
          ...((style as any) || {}),
        }}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
    );
  } else {
    // mobile: WebView
    return (
      <View style={[{ width: mapW, height: mapH }, style]}>
        <WebView
          source={{ uri: embedUrl }}
          style={StyleSheet.absoluteFill}
          scrollEnabled={false}
          scalesPageToFit
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
  },
  error: {
    color: Colors.red30,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default MapComponent;

