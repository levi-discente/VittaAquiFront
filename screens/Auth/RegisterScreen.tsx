import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { maskCPF, maskCEP, maskPhone, validateCPF } from '@/utils/forms';
import { Snackbar } from '../../components/Snackbar';
import {
  Button,
  Input,
  Text,
  XStack,
  YStack,
  Select,
  Label,
  Spinner,
} from 'tamagui';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const categories = [
  { label: 'Médico', value: 'doctor' },
  { label: 'Nutricionista', value: 'nutritionist' },
  { label: 'Psicólogo', value: 'psychologist' },
  { label: 'Psiquiatra', value: 'physician' },
  { label: 'Personal Trainer', value: 'personal_trainer' },
];

const statesBR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const RegisterScreen: React.FC<Props> = () => {
  const { signUp, loading } = useAuth();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.9, 400);

  const [step, setStep] = useState(1);
  const [snack, setSnack] = useState({ visible: false, message: '', type: 'success' });

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

  const showSnackbar = (message: string, type = 'success') =>
    setSnack({ visible: true, message, type });

  const ufOptions = useMemo(() => statesBR, []);
  const catOptions = useMemo(() => categories, []);

  return (
    <YStack flex={1} bg="$background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <YStack
            width={CARD_WIDTH}
            padding="$5"
            borderRadius="$4"
            bg="$background"
            elevation={4}
            space="$3"
          >
            <Text fontSize="$7" fontWeight="700" textAlign="center">Crie sua conta</Text>

            <Formik
              initialValues={{
                name: '', cpf: '', cep: '', uf: '', city: '',
                address: '', email: '', password: '', confirmPassword: '',
                phone: '', role: 'patient', profissional_identification: '', category: '',
              }}
              validationSchema={schema}
              onSubmit={async (values) => {
                try {
                  await signUp({
                    ...values,
                    cpf: values.cpf.replace(/\D/g, ''),
                    phone: values.phone.replace(/\D/g, ''),
                    cep: values.cep.replace(/\D/g, ''),
                  });
                  showSnackbar('Cadastro realizado com sucesso!', 'success');
                } catch (error: any) {
                  showSnackbar(error.message || 'Erro ao cadastrar', 'error');
                }
              }}
            >
              {({
                values, errors, handleChange, setFieldValue, handleSubmit, validateForm, isSubmitting,
              }) => {

                const steps = [
                  ['email', 'password', 'confirmPassword'],
                  ['name', 'cpf', 'phone'],
                  ['cep', 'uf', 'city', 'address'],
                  ['role', 'profissional_identification', 'category'],
                ];

                const validateStep = async () => {
                  const currentFields = steps[step - 1];
                  const allErrors = await validateForm();
                  const stepErrors = currentFields.reduce((acc, key) => {
                    if (allErrors[key]) acc[key] = allErrors[key];
                    return acc;
                  }, {} as any);

                  if (Object.keys(stepErrors).length) {
                    showSnackbar(Object.values(stepErrors)[0] as string, 'error');
                    return false;
                  }

                  return true;
                };

                const nextStep = async () => {
                  if (await validateStep()) setStep(step + 1);
                };

                return (
                  <>
                    {step === 1 && (
                      <>
                        <Input placeholder="Email" value={values.email} onChangeText={handleChange('email')} />
                        <Input placeholder="Senha" secureTextEntry value={values.password} onChangeText={handleChange('password')} />
                        <Input placeholder="Confirme a senha" secureTextEntry value={values.confirmPassword} onChangeText={handleChange('confirmPassword')} />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <Input placeholder="Nome completo" value={values.name} onChangeText={handleChange('name')} />
                        <Input placeholder="CPF" value={values.cpf} onChangeText={t => setFieldValue('cpf', maskCPF(t))} />
                        <Input placeholder="Telefone" value={values.phone} onChangeText={t => setFieldValue('phone', maskPhone(t))} />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <Input placeholder="CEP" value={values.cep} onChangeText={t => setFieldValue('cep', maskCEP(t))} />
                        <Select value={values.uf} onValueChange={val => setFieldValue('uf', val)}>
                          <Select.Trigger><Select.Value placeholder="Selecione UF" /></Select.Trigger>
                          <Select.Content>
                            {ufOptions.map(u => (<Select.Item key={u} value={u}><Select.ItemText>{u}</Select.ItemText></Select.Item>))}
                          </Select.Content>
                        </Select>
                        <Input placeholder="Cidade" value={values.city} onChangeText={handleChange('city')} />
                        <Input placeholder="Endereço" value={values.address} onChangeText={handleChange('address')} />
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <XStack space="$3">
                          {['patient', 'professional'].map(r => (
                            <Button key={r} flex={1} theme={values.role === r ? 'active' : 'gray'} onPress={() => setFieldValue('role', r)}>
                              {r === 'patient' ? 'Paciente' : 'Profissional'}
                            </Button>
                          ))}
                        </XStack>
                        {values.role === 'professional' && (
                          <>
                            <Input placeholder="Credencial" value={values.profissional_identification} onChangeText={handleChange('profissional_identification')} />
                            <Select value={values.category} onValueChange={val => setFieldValue('category', val)}>
                              <Select.Trigger><Select.Value placeholder="Categoria" /></Select.Trigger>
                              <Select.Content>
                                {catOptions.map(cat => (<Select.Item key={cat.value} value={cat.value}><Select.ItemText>{cat.label}</Select.ItemText></Select.Item>))}
                              </Select.Content>
                            </Select>
                          </>
                        )}
                      </>
                    )}

                    <Button mt="$3" onPress={step < 4 ? nextStep : handleSubmit} disabled={isSubmitting || loading}>
                      {isSubmitting ? <Spinner /> : step < 4 ? 'Próximo' : 'Cadastrar'}
                    </Button>
                  </>
                );
              }}
            </Formik>
          </YStack>
        </ScrollView>
        <Snackbar {...snack} onDismiss={() => setSnack({ ...snack, visible: false })} />
      </KeyboardAvoidingView>
    </YStack>
  );
};

