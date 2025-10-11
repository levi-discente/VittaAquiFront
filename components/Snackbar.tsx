import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SnackbarType = 'error' | 'warning' | 'success';

interface SnackbarOptions {
  text: string;
  type?: SnackbarType;
  duration?: number;
}

const COLORS: Record<SnackbarType, string> = {
  error: '#f44336',
  warning: '#ff9800',
  success: '#4caf50',
};

const Wrapper: React.ComponentType<any> = Platform.OS === 'web' ? View : SafeAreaView;

interface SnackbarComponent extends React.FC {
  show: (opts: SnackbarOptions) => void;
  hide: () => void;
}

let setGlobalState: ((opts: SnackbarOptions | null) => void) | null = null;

export const Snackbar: SnackbarComponent = () => {
  const [state, setState] = useState<SnackbarOptions | null>(null);

  useEffect(() => {
    setGlobalState = setState;
    return () => { setGlobalState = null; };
  }, []);

  useEffect(() => {
    if (!state) return;
    const timeout = setTimeout(() => setState(null), state.duration ?? 3000);
    return () => clearTimeout(timeout);
  }, [state]);

  if (!state) return null;

  return (
    <Wrapper style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: COLORS[state.type ?? 'success'] }]}>
        <Text style={styles.text}>{state.text}</Text>
      </View>
    </Wrapper>
  );
};

Snackbar.show = (opts: SnackbarOptions) => setGlobalState?.(opts);
Snackbar.hide = () => setGlobalState?.(null);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 6 : 0,
    pointerEvents: 'box-none',
  },
  container: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Snackbar;

