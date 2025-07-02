import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import {
  Text,
  TextField,
  Button,
  Colors,
  Picker,
  Card
} from 'react-native-ui-lib';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { maskCPF, maskCEP, maskPhone, validateCPF } from '@/utils/forms';
import { notifySuccess, notifyError } from '@/utils/notify';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.9, 400);

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
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];


type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, loading } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const schema = Yup.object().shape({
    name: Yup.string().required('Nome obrigatório'),
    cpf: Yup.string()
      .required('CPF obrigatório')
      .test('valid-cpf', 'CPF inválido', v => v ? validateCPF(v) : false),
    cep: Yup.string().required('CEP obrigatório'),
    uf: Yup.string().required('UF obrigatória'),
    city: Yup.string().required('Cidade obrigatória'),
    address: Yup.string().required('Endereço obrigatório'),
    email: Yup.string().email('Email inválido').required('Email obrigatório'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Senha obrigatória'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Senhas não conferem')
      .required('Confirme a senha'),
    role: Yup.string().oneOf(['patient', 'professional']).required(),
    profissional_identification: Yup.string().when('role', { is: 'professional', then: s => s.required('Credencial obrigatória') }),
    category: Yup.string().when('role', { is: 'professional', then: s => s.required('Categoria obrigatória') }),
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text text60 marginB-20 color={Colors.dark60}>
            Cadastro
          </Text>


          <Formik
            initialValues={{
              name: '', cpf: '', cep: '', uf: '', city: '', address: '',
              email: '', password: '', confirmPassword: '',
              phone: '', role: 'patient',
              profissional_identification: '', category: ''
            }}
            validationSchema={schema}
            validateOnChange={false}
            validateOnBlur={true}

            onSubmit={async (values, { setSubmitting }) => {
              try {
                const payload = {
                  name: values.name,
                  email: values.email,
                  password: values.password,
                  role: values.role as 'patient' | 'professional',
                  cpf: values.cpf.replace(/\D/g, ''),
                  phone: values.phone.replace(/\D/g, '') || undefined,
                  cep: values.cep.replace(/\D/g, ''),
                  uf: values.uf, city: values.city, address: values.address,
                  profissional_identification: values.role === 'professional' ? values.profissional_identification : undefined,
                  category: values.role === 'professional' ? values.category : undefined
                };
                await signUp(payload);
                notifySuccess('Cadastro realizado com sucesso');
              } catch (err: any) {
                notifyError(err.response?.data?.error || 'Erro ao cadastrar');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit, validateForm, setErrors, isSubmitting }) => {
              const fieldsByStep: Record<number, Array<keyof typeof values>> = {
                1: ['email', 'password', 'confirmPassword'],
                2: ['name', 'cpf', 'phone'],
                3: ['cep', 'uf', 'city', 'address'],
                4: ['role', 'profissional_identification', 'category']
              };

              const nextStep = async () => {
                try {
                  // valida cada campo individualmente
                  await Promise.all(
                    fieldsByStep[step].map(field =>
                      schema.validateAt(field as string, values)
                    )
                  );
                  // casting porque step+1 é number
                  setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
                } catch (err: any) {
                  const formErrors: Record<string, string> = {};
                  err.inner.forEach((e: Yup.ValidationError) => {
                    if (e.path) formErrors[e.path] = e.message;
                  });
                  setErrors(formErrors);
                }
              };

              const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
              return (
                <>
                  {step === 1 && (
                    <>
                      <TextField
                        placeholder="Email"
                        keyboardType="email-address"
                        value={values.email}
                        onChangeText={t => setFieldValue('email', t.trim().toLowerCase())}
                        onBlur={handleBlur('email')}
                        error={!!(touched.email && errors.email)}
                        style={styles.input}
                      />
                      {!!errors.email && <Text text90 red10>{errors.email}</Text>}

                      <TextField
                        placeholder="Senha"
                        secureTextEntry
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={!!(touched.password && errors.password)}
                        style={styles.input}
                      />
                      {!!errors.password && <Text text90 red10>{errors.password}</Text>}

                      <TextField
                        placeholder="Confirme a senha"
                        secureTextEntry
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        error={!!(touched.confirmPassword && errors.confirmPassword)}
                        style={styles.input}
                      />
                      {!!errors.confirmPassword && <Text text90 red10>{errors.confirmPassword}</Text>}
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <TextField
                        placeholder="Nome completo"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        error={!!(touched.name && errors.name)}
                        style={styles.input}
                      />
                      {!!errors.name && <Text text90 red10>{errors.name}</Text>}

                      <TextField
                        placeholder="CPF"
                        keyboardType="numeric"
                        value={values.cpf}
                        onChangeText={t => setFieldValue('cpf', maskCPF(t))}
                        onBlur={handleBlur('cpf')}
                        error={!!(touched.cpf && errors.cpf)}
                        style={styles.input}
                      />
                      {!!errors.cpf && <Text text90 red10>{errors.cpf}</Text>}
                      <TextField
                        text70
                        placeholder="Telefone"
                        keyboardType="phone-pad"
                        value={values.phone}
                        onChangeText={text => setFieldValue('phone', maskPhone(text))}
                        onBlur={handleBlur('phone')}
                        floatingPlaceholder
                        style={styles.input}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <TextField
                        placeholder="CEP"
                        keyboardType="numeric"
                        value={values.cep}
                        onChangeText={t => setFieldValue('cep', maskCEP(t))}
                        onBlur={handleBlur('cep')}
                        error={!!(touched.cep && errors.cep)}
                        style={styles.input}
                      />
                      {!!errors.cep && <Text text90 red10>{errors.cep}</Text>}

                      {/* UF como dropdown */}
                      <Picker
                        placeholder="UF"
                        value={values.uf}
                        onChange={item => setFieldValue('uf', item.value)}
                        style={styles.picker}
                      >
                        {statesBR.map(s => (
                          <Picker.Item key={s} value={s} label={s} />
                        ))}
                      </Picker>
                      {!!(touched.uf && errors.uf) && <Text text90 red10>{errors.uf}</Text>}

                      <TextField
                        placeholder="Cidade"
                        value={values.city}
                        onChangeText={handleChange('city')}
                        onBlur={handleBlur('city')}
                        error={!!(touched.city && errors.city)}
                        style={styles.input}
                      />
                      {!!errors.city && <Text text90 red10>{errors.city}</Text>}

                      <TextField
                        placeholder="Endereço"
                        value={values.address}
                        onChangeText={handleChange('address')}
                        onBlur={handleBlur('address')}
                        error={!!(touched.address && errors.address)}
                        style={styles.input}
                      />
                      {!!errors.address && <Text text90 red10>{errors.address}</Text>}
                    </>
                  )}

                  {step === 4 && (
                    <>

                      <Text text80 marginT-12>
                        Tipo de usuário
                      </Text>
                      <View style={styles.switchContainer}>
                        <Button
                          outline={values.role !== 'patient'}
                          label="Paciente"
                          onPress={() => setFieldValue('role', 'patient')}
                          secondary
                          marginR-8
                        />
                        <Button
                          outline={values.role !== 'professional'}
                          label="Profissional"
                          onPress={() => setFieldValue('role', 'professional')}
                          secondary
                        />
                      </View>

                      {/* Campos de profissional renderizados inline */}
                      {values.role === 'professional' && (
                        <>
                          <TextField
                            text70
                            placeholder="credencial / Descrição"
                            value={values.profissional_identification}
                            onChangeText={handleChange('profissional_identification')}
                            onBlur={handleBlur('profissional_identification')}
                            floatingPlaceholder
                            style={styles.input}
                            error={!!(touched.profissional_identification && errors.profissional_identification)}
                          />
                          {!!(touched.profissional_identification && errors.profissional_identification) && (
                            <Text text90 red10>{errors.profissional_identification}</Text>
                          )}


                          <Picker
                            placeholder="Categoria"
                            value={values.category}
                            onChange={item => setFieldValue('category', (item as any).value)}
                            style={styles.picker}
                            topBarProps={{ title: 'Selecione categoria' }}
                          >
                            {categories.map(c => (
                              <Picker.Item key={c.value} value={c.value} label={c.label} />
                            ))}
                          </Picker>
                          {!!(touched.category && errors.category) && (
                            <Text text90 red10>{errors.category}</Text>
                          )}
                        </>
                      )}
                    </>
                  )}
                  <View style={styles.buttonsRow}>
                    {step > 1 && (
                      <Button
                        outline
                        label="Voltar"
                        onPress={prevStep}
                        disabled={isSubmitting || loading}
                      />
                    )}
                    {step < 4 ? (
                      <Button
                        label="Próximo"
                        onPress={nextStep}
                        disabled={isSubmitting || loading}
                      />
                    ) : (
                      <Button
                        label="Cadastrar"
                        onPress={handleSubmit as any}
                        disabled={isSubmitting || loading}
                        loading={isSubmitting || loading}
                      />
                    )}
                  </View>
                </>
              )
            }}
          </Formik>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { alignItems: 'center', paddingVertical: 24 },
  card: {
    width: CARD_WIDTH, padding: 24, borderRadius: 8,
    backgroundColor: Colors.white,
    shadowColor: Colors.black, shadowOpacity: 0.1,
    shadowRadius: 8, elevation: 4
  },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 100, height: 60 },
  stepperContainer: { marginBottom: 16 },
  progressBar: { height: 4, borderRadius: 2 },
  stepperText: { alignSelf: 'flex-end', marginTop: 4 },
  input: { marginTop: 12 },
  picker: { marginTop: 12, borderBottomWidth: 1, borderColor: Colors.grey40 },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24
  },
  switchContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    alignItems: 'center'
  }
});


export default RegisterScreen;
