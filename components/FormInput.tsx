import React from 'react';
import { TextField } from 'react-native-ui-lib';

interface FormInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  style?: object;
  errorMessage?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  style = {},
  errorMessage,
}) => (
  <>
    {label && <TextField text80 marginB-4>{label}</TextField>}
    <TextField
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      floatingPlaceholder
      style={style}
    />
    {errorMessage ? (
      <TextField text90 red10 marginT-4>
        {errorMessage}
      </TextField>
    ) : null}
  </>
);

export default FormInput;
