import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  Animated,
} from 'react-native';
import {
  Layout,
  Card,
  Input,
  Select,
  SelectItem,
  IndexPath,
  RadioGroup,
  Radio,
  Button,
  Text,
} from '@ui-kitten/components';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { maskCPF, maskCEP, maskPhone, validateCPF } from '@/utils/forms';

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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp, loading } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const { width, height } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.9, 400);
  const CARD_HEIGHT = Math.min(height * 0.85, 600);

  const [ufIndex, setUfIndex] = useState(new IndexPath(0));
  const [catIndex, setCatIndex] = useState(new IndexPath(0));

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpacity] = useState(new Animated.Value(0));

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    Animated.timing(snackbarOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(snackbarOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setSnackbarVisible(false));
      }, 3000);
    });
  };

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
    profissional_identification: Yup.string().when('role', {
      is: 'professional', then: s => s.required('Credencial obrigatória'),
    }),
    category: Yup.string().when('role', {
      is: 'professional', then: s => s.required('Categoria obrigatória'),
    }),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={[styles.card, { width: CARD_WIDTH, minHeight: CARD_HEIGHT }]}>
            <Text category="h5" style={styles.title}>Cadastro</Text>

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
              validateOnChange={false}
              validateOnBlur
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
                    uf: values.uf,
                    city: values.city,
                    address: values.address,
                    profissional_identification:
                      values.role === 'professional'
                        ? values.profissional_identification
                        : undefined,
                    category:
                      values.role === 'professional'
                        ? values.category
                        : undefined,
                  };
                  await signUp(payload);
                  showSnackbar('Cadastro realizado com sucesso!');
                } catch (error: any) {
                  showSnackbar("Cadastro :" + error.message || 'Erro ao cadastrar');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                handleSubmit,
                setErrors,
                isSubmitting,
              }) => {
                const fieldsByStep: Record<number, Array<keyof typeof values>> = {
                  1: ['email', 'password', 'confirmPassword'],
                  2: ['name', 'cpf'],
                  3: ['cep', 'uf', 'city', 'address'],
                  4: ['role', 'profissional_identification', 'category'],
                };

                const nextStep = async () => {
                  try {
                    await Promise.all(
                      fieldsByStep[step].map(f =>
                        schema.validateAt(f as string, values)
                      )
                    );
                    setStep(s => (s + 1) as 1 | 2 | 3 | 4);
                  } catch (err: any) {
                    const fe: Record<string, string> = {};
                    if (Array.isArray(err)) {
                      err.forEach((e: Yup.ValidationError) => {
                        if (e.path) fe[e.path] = e.message;
                      });
                    } else if (err instanceof Yup.ValidationError) {
                      if (err.path) fe[err.path] = err.message;
                    }
                    setErrors(fe);
                  }
                };

                const prevStep = () =>
                  setStep(s => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

                return (
                  <Layout level="1" style={styles.form}>
                    {/* STEP 1 */}
                    {step === 1 && (
                      <>
                        <Input
                          placeholder="Email"
                          keyboardType="email-address"
                          value={values.email}
                          onChangeText={t =>
                            setFieldValue('email', t.trim().toLowerCase())
                          }
                          onBlur={handleBlur('email')}
                          status={touched.email && errors.email ? 'danger' : 'basic'}
                          caption={touched.email && errors.email ? errors.email : undefined}
                          style={styles.field}
                        />
                        <Input
                          placeholder="Senha"
                          secureTextEntry
                          value={values.password}
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                          status={touched.password && errors.password ? 'danger' : 'basic'}
                          caption={touched.password && errors.password ? errors.password : undefined}
                          style={styles.field}
                        />
                        <Input
                          placeholder="Confirme a senha"
                          secureTextEntry
                          value={values.confirmPassword}
                          onChangeText={handleChange('confirmPassword')}
                          onBlur={handleBlur('confirmPassword')}
                          status={
                            touched.confirmPassword && errors.confirmPassword
                              ? 'danger'
                              : 'basic'
                          }
                          caption={
                            touched.confirmPassword && errors.confirmPassword
                              ? errors.confirmPassword
                              : undefined
                          }
                          style={styles.field}
                        />
                      </>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                      <>
                        <Input
                          placeholder="Nome completo"
                          value={values.name}
                          onChangeText={handleChange('name')}
                          onBlur={handleBlur('name')}
                          status={touched.name && errors.name ? 'danger' : 'basic'}
                          caption={touched.name && errors.name ? errors.name : undefined}
                          style={styles.field}
                        />
                        <Input
                          placeholder="CPF"
                          keyboardType="numeric"
                          value={values.cpf}
                          onChangeText={t => setFieldValue('cpf', maskCPF(t))}
                          onBlur={handleBlur('cpf')}
                          status={touched.cpf && errors.cpf ? 'danger' : 'basic'}
                          caption={touched.cpf && errors.cpf ? errors.cpf : undefined}
                          style={styles.field}
                        />
                        <Input
                          placeholder="Telefone"
                          keyboardType="phone-pad"
                          value={values.phone}
                          onChangeText={t => setFieldValue('phone', maskPhone(t))}
                          onBlur={handleBlur('phone')}
                          style={styles.field}
                        />
                      </>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                      <>
                        <Input
                          placeholder="CEP"
                          keyboardType="numeric"
                          value={values.cep}
                          onChangeText={t => setFieldValue('cep', maskCEP(t))}
                          onBlur={handleBlur('cep')}
                          status={touched.cep && errors.cep ? 'danger' : 'basic'}
                          caption={touched.cep && errors.cep ? errors.cep : undefined}
                          style={styles.field}
                        />

                        {Platform.OS === 'web' ? (
                          <View style={styles.field}>
                            <select
                              value={values.uf}
                              onChange={e => {
                                setFieldValue('uf', e.target.value);
                                handleBlur('uf');
                              }}
                              style={styles.webSelect}
                            >
                              <option value="" disabled>Selecione UF</option>
                              {statesBR.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {touched.uf && errors.uf && (
                              <Text status="danger" category="c2">
                                {errors.uf}
                              </Text>
                            )}
                          </View>
                        ) : (
                          <Select
                            placeholder="Selecione UF"
                            selectedIndex={ufIndex}
                            value={
                              ufIndex.row === 0
                                ? ''
                                : statesBR[ufIndex.row - 1]
                            }
                            onSelect={idxRaw => {
                              const idx = Array.isArray(idxRaw) ? idxRaw[0] : idxRaw;
                              setUfIndex(idx);
                              const uf = idx.row === 0
                                ? ''
                                : statesBR[idx.row - 1];
                              setFieldValue('uf', uf);
                              handleBlur('uf');
                            }}
                            style={styles.field}
                          >
                            <SelectItem title="Selecione UF" />
                            {statesBR.map(s => (
                              <SelectItem key={s} title={s} />
                            ))}
                          </Select>
                        )}

                        <Input
                          placeholder="Cidade"
                          value={values.city}
                          onChangeText={handleChange('city')}
                          onBlur={handleBlur('city')}
                          status={touched.city && errors.city ? 'danger' : 'basic'}
                          caption={touched.city && errors.city ? errors.city : undefined}
                          style={styles.field}
                        />
                        <Input
                          placeholder="Endereço"
                          value={values.address}
                          onChangeText={handleChange('address')}
                          onBlur={handleBlur('address')}
                          status={touched.address && errors.address ? 'danger' : 'basic'}
                          caption={touched.address && errors.address ? errors.address : undefined}
                          style={styles.field}
                        />
                      </>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                      <>
                        <Text category="s1" style={styles.label}>
                          Tipo de usuário
                        </Text>
                        <RadioGroup
                          selectedIndex={values.role === 'professional' ? 1 : 0}
                          onChange={idx =>
                            setFieldValue(
                              'role',
                              idx === 0 ? 'patient' : 'professional'
                            )
                          }
                          style={styles.field}
                        >
                          <Radio>Paciente</Radio>
                          <Radio>Profissional</Radio>
                        </RadioGroup>

                        {values.role === 'professional' && (
                          <>
                            <Input
                              placeholder="Credencial / Descrição"
                              value={values.profissional_identification}
                              onChangeText={handleChange(
                                'profissional_identification'
                              )}
                              onBlur={handleBlur(
                                'profissional_identification'
                              )}
                              status={
                                touched.profissional_identification &&
                                  errors.profissional_identification
                                  ? 'danger'
                                  : 'basic'
                              }
                              caption={
                                touched.profissional_identification &&
                                  errors.profissional_identification
                                  ? errors.profissional_identification
                                  : undefined
                              }
                              style={styles.field}
                            />

                            {Platform.OS === 'web' ? (
                              <View style={styles.field}>
                                <select
                                  value={values.category}
                                  onChange={e => {
                                    setFieldValue('category', e.target.value);
                                    handleBlur('category');
                                  }}
                                  style={styles.webSelect}
                                >
                                  <option value="" disabled>
                                    Selecione categoria
                                  </option>
                                  {categories.map(c => (
                                    <option
                                      key={c.value}
                                      value={c.value}
                                    >
                                      {c.label}
                                    </option>
                                  ))}
                                </select>
                                {touched.category && errors.category && (
                                  <Text status="danger" category="c2">
                                    {errors.category}
                                  </Text>
                                )}
                              </View>
                            ) : (
                              <Select
                                placeholder="Selecione categoria"
                                selectedIndex={catIndex}
                                value={
                                  catIndex.row === 0
                                    ? ''
                                    : categories[catIndex.row - 1].label
                                }
                                onSelect={idxRaw => {
                                  const idx = Array.isArray(idxRaw)
                                    ? idxRaw[0]
                                    : idxRaw;
                                  setCatIndex(idx);
                                  const cat =
                                    idx.row === 0
                                      ? ''
                                      : categories[idx.row - 1].value;
                                  setFieldValue('category', cat);
                                  handleBlur('category');
                                }}
                                style={styles.field}
                              >
                                <SelectItem title="Selecione categoria" />
                                {categories.map(c => (
                                  <SelectItem
                                    key={c.value}
                                    title={c.label}
                                  />
                                ))}
                              </Select>
                            )}
                          </>
                        )}
                      </>
                    )}

                    <View style={styles.buttonsRow}>
                      {step > 1 && (
                        <Button
                          appearance="outline"
                          onPress={() => setStep(s => Math.max(s - 1, 1) as 1 | 2 | 3 | 4)}
                          disabled={isSubmitting || loading}
                          style={styles.button}
                        >
                          Voltar
                        </Button>
                      )}
                      {step < 4 ? (
                        <Button
                          onPress={async () => {
                            try {
                              await Promise.all(
                                fieldsByStep[step].map(f =>
                                  schema.validateAt(f as string, values)
                                )
                              );
                              setStep(s => (s + 1) as 1 | 2 | 3 | 4);
                            } catch (err: any) {
                              const fe: Record<string, string> = {};
                              if (Array.isArray(err)) {
                                err.forEach((e: Yup.ValidationError) => {
                                  if (e.path) fe[e.path] = e.message;
                                });
                              } else if (err instanceof Yup.ValidationError) {
                                if (err.path) fe[err.path] = err.message;
                              }
                              setErrors(fe);
                            }
                          }}
                          disabled={isSubmitting || loading}
                          style={styles.button}
                        >
                          Próximo
                        </Button>
                      ) : (
                        <Button
                          onPress={() => handleSubmit()}
                          disabled={isSubmitting}
                          style={styles.button}
                        >
                          Cadastrar
                        </Button>
                      )}
                    </View>
                  </Layout>
                );
              }}
            </Formik>

            {snackbarVisible && (
              <Animated.View
                style={[styles.snackbar, { opacity: snackbarOpacity }]}
              >
                <Text style={styles.snackbarText}>{snackbarMessage}</Text>
              </Animated.View>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  card: { padding: 24, borderRadius: 8 },
  title: { marginBottom: 16 },
  form: { flex: 1 },
  field: { marginBottom: 16 },
  label: { marginVertical: 8 },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: { flex: 1, marginHorizontal: 4 },
  webSelect: {
    width: '100%',
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#c4c4c4',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  snackbar: {
    position: 'absolute',
    bottom: -100,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ff0000',
    opacity: 5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snackbarText: {
    color: 'white',
  },
});

export default RegisterScreen;

