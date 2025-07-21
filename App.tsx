import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppProviders from './AppProviders';
import Navigation from './navigation';

const App: React.FC = () => (
  <AppProviders>
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  </AppProviders>
);

export default App;

