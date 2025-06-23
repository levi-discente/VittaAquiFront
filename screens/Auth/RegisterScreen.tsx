// src/screens/Auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextField, Button, Colors } from 'react-native-ui-lib';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();

  // estados do formulário
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'professional'>('patient');

  // **novos campos**
  const [cpf, setCpf] = useState('');           // obrigatório
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // campos profissionais (step 2)
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // validações
  const isStep1Valid = !!name && !!email && !!password && !!cpf;

  const handleRegister = async () => {
    // se for profissional e ainda no step 1, avançamos
    if (role === 'professional' && step === 1) {
      setError(null);
      setStep(2);
      return;
    }

    // validação final
    if (!isStep1Valid) {
      setError('Preencha todos os campos obrigatórios (incluindo CPF).');
      return;
    }
    if (role === 'professional' && (!bio || !category)) {
      setError('Preencha Bio e Categoria para profissionais.');
      return;
    }

    try {
      setLoading(true);
      await signUp({
        name,
        email,
        password,
        role,
        cpf,
        phone: phone || undefined,
        cep: cep || undefined,
        uf: uf || undefined,
        city: city || undefined,
        address: address || undefined,
        bio: role === 'professional' ? bio : undefined,
        category: role === 'professional' ? category : undefined,
      });
      // o AuthContext faz o redirect para Home
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setError(null);
      setStep(1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text text60 marginB-20 color={Colors.dark60}>
          {step === 1 ? 'Cadastro' : 'Dados Profissional'}
        </Text>

        {error && <Text text80 red10 marginB-10>{error}</Text>}

        {step === 1 && (
          <>
            <TextField
              text70
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
              floatingPlaceholder
            />

            <TextField
              text70
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              floatingPlaceholder
              style={styles.input}
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

            {/* novo: CPF (obrigatório) */}
            <TextField
              text70
              placeholder="CPF"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              floatingPlaceholder
              style={styles.input}
            />

            {/* novos campos opcionais */}
            <TextField
              text70
              placeholder="Telefone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              floatingPlaceholder
              style={styles.input}
            />
            <TextField
              text70
              placeholder="CEP"
              value={cep}
              onChangeText={setCep}
              keyboardType="numeric"
              floatingPlaceholder
              style={styles.input}
            />
            <TextField
              text70
              placeholder="UF"
              value={uf}
              onChangeText={setUf}
              floatingPlaceholder
              style={styles.input}
            />
            <TextField
              text70
              placeholder="Cidade"
              value={city}
              onChangeText={setCity}
              floatingPlaceholder
              style={styles.input}
            />
            <TextField
              text70
              placeholder="Endereço"
              value={address}
              onChangeText={setAddress}
              floatingPlaceholder
              style={styles.input}
            />

            <Text text80 marginV-10>
              Tipo de usuário
            </Text>
            <View style={styles.switchContainer}>
              <Button
                outline={role !== 'patient'}
                label="Paciente"
                onPress={() => setRole('patient')}
                secondary
                marginR-8
              />
              <Button
                outline={role !== 'professional'}
                label="Profissional"
                onPress={() => setRole('professional')}
                secondary
              />
            </View>
          </>
        )}

        {step === 2 && role === 'professional' && (
          <>
            <TextField
              text70
              placeholder="Bio / Descrição"
              value={bio}
              onChangeText={setBio}
              multiline
              floatingPlaceholder
              style={styles.input}
            />
            <TextField
              text70
              placeholder="Categoria (ex: Nutricionista)"
              value={category}
              onChangeText={setCategory}
              floatingPlaceholder
              style={styles.input}
            />
          </>
        )}

        <View style={styles.buttonsRow}>
          {step === 2 && (
            <Button outline label="Voltar" onPress={handleBack} disabled={loading} />
          )}
          <Button
            label={
              role === 'professional'
                ? step === 1
                  ? 'Próximo'
                  : 'Cadastrar'
                : 'Cadastrar'
            }
            onPress={handleRegister}
            disabled={
              loading ||
              (step === 1 ? !isStep1Valid : role === 'professional' ? (!bio || !category) : false)
            }
            loading={loading}
            style={step === 2 ? { marginLeft: 8 } : undefined}
          />
        </View>

        {step === 1 && (
          <Button link label="Já tenho conta. Entrar" onPress={() => navigation.navigate('Login')} marginT-15 />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { padding: 24 },
  input: { marginTop: 12 },
  switchContainer: { flexDirection: 'row', marginBottom: 12, marginTop: 8 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
});

export default RegisterScreen;
