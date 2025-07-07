import React from 'react';
import { IconRegistry, ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { AuthProvider } from './context/AuthContext';
import Navigation from './navigation';

const App: React.FC = () => (
  <>
    {/* Registra o pack de ícones */}
    <IconRegistry icons={EvaIconsPack} />

    {/* Provê tema e styles do Eva Design */}
    <ApplicationProvider {...eva} theme={eva.light}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ApplicationProvider>
  </>
);

export default App;

