import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import {
  maskCPF,
  maskCEP,
  maskPhone,
  validateCPF,
  fetchAddressByCep,
} from '@/utils/forms';
import { Snackbar } from '../../components/Snackbar';
import { AppSelect, Option } from '../../components/ui/AppSelect';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
const TOTAL_STEPS = 4;

const categories: Option[] = [
  { label: 'Médico', value: 'doctor' },
  { label: 'Nutricionista', value: 'nutritionist' },
  { label: 'Psicólogo', value: 'psychologist' },
  { label: 'Psiquiatra', value: 'physician' },
  { label: 'Personal Trainer', value: 'personal_trainer' },
];

const statesBR: Option[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map(s => ({ label: s, value: s }));

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, loading } = useAuth();
  const { width } = Dimensions.get('window');
  const CARD_WIDTH = Math.min(width * 0.9, 400);

  const [step, setStep] = useState(1);
  const [addressLoading, setAddressLoading] = useState(false);
  const [snack, setSnack] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning',
  });

  const schema = Yup.object().shape({
    name: Yup.string().required('Nome obrigatório'),
    cpf: Yup.string()
      .required('CPF obrigatório')
      .test('valid-cpf', 'CPF inválido', v => (v ? validateCPF(v) : false)),
    cep: Yup.string().required('CEP obrigatório'),
    uf: Yup.string().required('UF obrigatória'),
    city: Yup.string().required('Cidade obrigatória'),
    address: Yup.string().required('Endereço obrigatório'),
    email: Yup.string().email('Email inválido').required('Email obrigatório'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Senha obrigatória'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Senhas não conferem')
      .required('Confirme a senha'),
    phone: Yup.string(),
    role: Yup.string().oneOf(['patient', 'professional']).required(),
    profissional_identification: Yup.string().when('role', {
      is: 'professional',
      then: s => s.required('Credencial obrigatória'),
    }),
    category: Yup.string().when('role', {
      is: 'professional',
      then: s => s.required('Categoria obrigatória'),
    }),
  });

  const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' = 'success') =>
    setSnack({ visible: true, message, type });

  const ufOptions = useMemo(() => statesBR, []);
  const catOptions = useMemo(() => categories, []);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Barra de progresso */}
          <View style={[styles.progressBarContainer, { width: CARD_WIDTH }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(step / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>

          <View style={[styles.card, { width: CARD_WIDTH }]}>
            <Text style={styles.title}>Crie sua conta</Text>

            <Formik
              initialValues={{
                name: '',
                cpf: '',
                cep: '',
                uf: '',
                city: '',
                address: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                role: 'patient',
                profissional_identification: '',
                category: '',
              }}
              validationSchema={schema}
              onSubmit={async values => {
                try {
                  await signUp({
                    ...values,
                    cpf: values.cpf.replace(/\D/g, ''),
                    phone: values.phone.replace(/\D/g, ''),
                    cep: values.cep.replace(/\D/g, ''),
                  });
                  showSnackbar('Cadastro realizado com sucesso!', 'success');
                } catch (error: any) {
                  const backendMsg =
                    error.response?.data?.error ??
                    error.response?.data?.message ??
                    error.message ??
                    'Erro ao cadastrar';
                  showSnackbar(backendMsg, 'error');
                }
              }}
            >
              {({
                values,
                handleChange,
                setFieldValue,
                handleSubmit,
                validateForm,
                isSubmitting,
              }) => {
                const steps = [
                  ['email', 'password', 'confirmPassword'],
                  ['name', 'cpf', 'phone'],
                  ['cep', 'uf', 'city', 'address'],
                  ['role', 'profissional_identification', 'category'],
                ];

                const validateStep = async () => {
                  const current = steps[step - 1];
                  const allErrors = await validateForm();
                  const stepErr = current.reduce((acc, key) => {
                    if ((allErrors as any)[key]) acc[key] = (allErrors as any)[key];
                    return acc;
                  }, {} as Record<string, string>);
                  if (Object.keys(stepErr).length) {
                    showSnackbar(Object.values(stepErr)[0], 'error');
                    return false;
                  }
                  return true;
                };

                const nextStep = async () => {
                  if (await validateStep()) setStep(step + 1);
                };

                const goBack = () => setStep(step - 1);

                // handler para CEP + busca de endereço
                const handleCepChange = async (text: string) => {
                  const cleaned = text.replace(/\D/g, '').slice(0, 8);
                  setFieldValue('cep', maskCEP(text));
                  if (cleaned.length === 8) {
                    setAddressLoading(true);
                    try {
                      const { uf, city, address } = await fetchAddressByCep(cleaned);
                      setFieldValue('uf', uf);
                      setFieldValue('city', city);
                      setFieldValue('address', address);
                    } catch (err: any) {
                      showSnackbar(err.message, 'warning');
                    } finally {
                      setAddressLoading(false);
                    }
                  }
                };

                return (
                  <View>
                    {step === 1 && (
                      <>
                        <TextInput
                          placeholder="Email"
                          style={styles.input}
                          value={values.email}
                          onChangeText={handleChange('email')}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        <TextInput
                          placeholder="Senha"
                          style={styles.input}
                          secureTextEntry
                          value={values.password}
                          onChangeText={handleChange('password')}
                        />
                        <TextInput
                          placeholder="Confirme a senha"
                          style={styles.input}
                          secureTextEntry
                          value={values.confirmPassword}
                          onChangeText={handleChange('confirmPassword')}
                        />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <TextInput
                          placeholder="Nome completo"
                          style={styles.input}
                          value={values.name}
                          onChangeText={handleChange('name')}
                        />
                        <TextInput
                          placeholder="CPF"
                          style={styles.input}
                          value={values.cpf}
                          onChangeText={t => setFieldValue('cpf', maskCPF(t))}
                          keyboardType="numeric"
                        />
                        <TextInput
                          placeholder="Telefone"
                          style={styles.input}
                          value={values.phone}
                          onChangeText={t => setFieldValue('phone', maskPhone(t))}
                          keyboardType="phone-pad"
                        />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <TextInput
                          placeholder="CEP"
                          style={styles.input}
                          value={values.cep}
                          onChangeText={handleCepChange}
                          keyboardType="numeric"
                        />
                        {addressLoading && (
                          <ActivityIndicator style={{ marginBottom: 12 }} />
                        )}
                        <AppSelect
                          options={ufOptions}
                          selectedValue={values.uf}
                          onValueChange={val => setFieldValue('uf', val)}
                          placeholder="Selecione UF"
                        />
                        <TextInput
                          placeholder="Cidade"
                          style={styles.input}
                          value={values.city}
                          onChangeText={handleChange('city')}
                        />
                        <TextInput
                          placeholder="Endereço"
                          style={styles.input}
                          value={values.address}
                          onChangeText={handleChange('address')}
                        />
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <View style={styles.toggleContainer}>
                          <TouchableOpacity
                            style={[
                              styles.toggleButton,
                              values.role === 'patient' && styles.toggleButtonActive,
                            ]}
                            onPress={() => setFieldValue('role', 'patient')}
                          >
                            <Text style={styles.toggleText}>Paciente</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.toggleButton,
                              styles.toggleButtonMargin,
                              values.role === 'professional' && styles.toggleButtonActive,
                            ]}
                            onPress={() => setFieldValue('role', 'professional')}
                          >
                            <Text style={styles.toggleText}>Profissional</Text>
                          </TouchableOpacity>
                        </View>
                        {values.role === 'professional' && (
                          <>
                            <TextInput
                              placeholder="Credencial"
                              style={styles.input}
                              value={values.profissional_identification}
                              onChangeText={handleChange('profissional_identification')}
                            />
                            <AppSelect
                              options={catOptions}
                              selectedValue={values.category}
                              onValueChange={val => setFieldValue('category', val)}
                              placeholder="Categoria"
                            />
                          </>
                        )}
                      </>
                    )}

                    <View style={styles.buttonRow}>
                      {step > 1 && (
                        <TouchableOpacity
                          style={styles.buttonSecondary}
                          onPress={goBack}
                          disabled={isSubmitting || loading}
                        >
                          <Text style={styles.buttonSecondaryText}>Voltar</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[
                          styles.button,
                          (isSubmitting || loading) && styles.buttonDisabled,
                          step > 1 && { marginLeft: 8 },
                        ]}
                        onPress={step < TOTAL_STEPS ? nextStep : handleSubmit as any}
                        disabled={isSubmitting || loading}
                      >
                        {isSubmitting || loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonText}>
                            {step < TOTAL_STEPS ? 'Próximo' : 'Cadastrar'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            </Formik>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Já tem conta? Faça login</Text>
            </TouchableOpacity>
          </View>

          <Snackbar
            visible={snack.visible}
            message={snack.message}
            type={snack.type}
            onDismiss={() => setSnack(s => ({ ...s, visible: false }))}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: { height: '100%', backgroundColor: '#007AFF' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 20
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    padding: 10, marginBottom: 12, fontSize: 16,
  },
  toggleContainer: { flexDirection: 'row', marginBottom: 12 },
  toggleButton: {
    flex: 1, padding: 12, borderRadius: 4,
    backgroundColor: '#ccc', alignItems: 'center',
  },
  toggleButtonActive: { backgroundColor: '#007AFF' },
  toggleButtonMargin: { marginLeft: 8 },
  toggleText: { color: '#fff', fontSize: 16 },
  buttonRow: {
    flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end'
  },
  buttonSecondary: {
    flex: 1, padding: 12, borderRadius: 4,
    borderWidth: 1, borderColor: '#007AFF', alignItems: 'center',
  },
  buttonSecondaryText: { color: '#007AFF', fontSize: 16 },
  button: {
    flex: 1, backgroundColor: '#007AFF', padding: 12,
    borderRadius: 4, alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#A0A0A0' },
  buttonText: { color: '#fff', fontSize: 16 },
  link: {
    color: '#007AFF', textAlign: 'center', marginTop: 15
  },
});

export default RegisterScreen;
