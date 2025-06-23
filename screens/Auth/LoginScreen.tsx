import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextField, Button, Colors } from 'react-native-ui-lib';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await signIn(email.trim(), password);
      console.log('Login realizado com sucesso', response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.inner}>
        <Text text60 marginB-20 color={Colors.dark60}>
          Entrar
        </Text>

        {error ? <Text text80 red10 marginB-10>{error}</Text> : null}

        <TextField
          text70
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          floatingPlaceholder
        />

        <TextField
          text70
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          floatingPlaceholder
          style={styles.input}
        />

        <Button
          label="Entrar"
          onPress={handleLogin}
          disabled={loading || !email || !password}
          loading={loading}
          marginT-20
        />

        <Button
          link
          label="Ainda não tem conta? Cadastre-se"
          onPress={() => navigation.navigate('Register')}
          marginT-15
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  input: {
    marginTop: 12,
  },
});

export default LoginScreen;

