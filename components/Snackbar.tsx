
import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { XStack, SizableText } from 'tamagui'
import { CircleCheck, AlertTriangle, Info } from '@tamagui/lucide-icons'

type SnackbarType = 'error' | 'warning' | 'success'

interface SnackbarProps {
  visible: boolean
  message: string
  type?: SnackbarType
  duration?: number
  onDismiss?: () => void
}

const COLORS: Record<SnackbarType, { bg: string; icon: React.ElementType }> = {
  error: {
    bg: '$red9',
    icon: AlertTriangle,
  },
  warning: {
    bg: '$yellow9',
    icon: Info,
  },
  success: {
    bg: '$green9',
    icon: CircleCheck,
  },
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss = () => { },
}) => {
  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(onDismiss, duration)
    return () => clearTimeout(timeout)
  }, [visible])

  if (!visible) return null

  const { bg, icon: Icon } = COLORS[type]

  return (
    <SafeAreaView
      edges={Platform.OS === 'web' ? [] : ['bottom']}
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        elevation: Platform.OS === 'android' ? 6 : 0,
      }}
    >
      <XStack
        bg={bg}
        borderRadius="$4"
        px="$4"
        py="$3"
        alignItems="center"
        space="$3"
      >
        <Icon size={20} color="white" />
        <SizableText size="$4" color="white" flex={1}>
          {message}
        </SizableText>
      </XStack>
    </SafeAreaView>
  )
}

