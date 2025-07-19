import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface Option {
  label: string;
  value: string;
}

export interface AppSelectProps {
  options: Option[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: any;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  options,
  selectedValue = '',
  onValueChange,
  placeholder = 'Selecione...',
  style,
}) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, style]}>
        <select
          value={selectedValue}
          onChange={e => onValueChange(e.target.value)}
          style={styles.webSelect}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  return (
    <View style={[styles.pickerContainer, style]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={val => onValueChange(val)}
      >
        <Picker.Item label={placeholder} value="" />
        {options.map(o => (
          <Picker.Item key={o.value} label={o.label} value={o.value} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: { marginBottom: 16 },
  webSelect: {
    width: '100%',
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#c4c4c4',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#c4c4c4',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
});

