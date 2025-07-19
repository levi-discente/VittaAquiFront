import React, { useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SnackbarType = 'error' | 'warning' | 'success';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  duration?: number;
  onDismiss?: () => void;
}

const COLORS: Record<SnackbarType, string> = {
  error: '#f44336',
  warning: '#ff9800',
  success: '#4caf50',
};

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss = () => { },
}) => {
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(onDismiss, duration);
    return () => clearTimeout(timeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <SafeAreaView
      edges={Platform.OS === 'web' ? [] : ['bottom']}
      style={styles.safeArea}
    >
      <View style={[styles.container, { backgroundColor: COLORS[type] }]}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  container: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

