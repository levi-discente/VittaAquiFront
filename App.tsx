import { TamaguiProvider } from 'tamagui'

import Navigation from './navigation'
import { AuthProvider } from './context/AuthContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from '@tamagui/core'

const config = createTamagui(defaultConfig)

type Conf = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf { }
}

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <SafeAreaProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  )
}

