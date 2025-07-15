import { config as baseConfig } from '@tamagui/config/v2'
import { createTamagui } from '@tamagui/core'

const config = createTamagui({
  ...baseConfig,
  themeClassNameOnRoot: true,
})

export type Conf = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf { }
}

export default config
