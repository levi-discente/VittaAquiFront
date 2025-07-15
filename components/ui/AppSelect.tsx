import React from 'react'
import {
  Select,
  Adapt,
  Sheet,
  YStack,
  Label
} from 'tamagui'

interface Option {
  label: string
  value: string
}

interface AppSelectProps {
  options: Option[]
  selectedValue?: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
}

export const AppSelect: React.FC<AppSelectProps> = ({
  options,
  selectedValue = '',
  onValueChange,
  placeholder = 'Selecione...',
  label,
}) => {
  return (
    <YStack space="$2">
      {label && <Label>{label}</Label>}

      <Select
        id="app-select"
        value={selectedValue}
        onValueChange={onValueChange}
      >
        <Select.Trigger>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>

        <Adapt when="sm">
          <Sheet modal dismissOnSnapToBottom snapPoints={[60]}>
            <Sheet.Frame>
              <Adapt.Contents />
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <Select.Content>
          <Select.ScrollUpButton />
          <Select.Viewport>
            <Select.Item index={0} value="">
              <Select.ItemText>{placeholder}</Select.ItemText>
            </Select.Item>

            {options.map((opt, index) => (
              <Select.Item index={index + 1} key={opt.value} value={opt.value}>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>
    </YStack>
  )
}

