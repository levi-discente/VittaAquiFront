import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Dimensions,
} from 'react-native'
import { Text, Button, Colors } from 'react-native-ui-lib'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { Snackbar } from '@/components/Snackbar'
import { AppSelect, Option } from '@/components/ui/AppSelect'
import {
  maskCPF,
  maskCEP,
  maskPhone,
  validateCPF,
  fetchAddressByCep,
} from '@/utils/forms'

// Lista de UFs para o AppSelect
const STATES: Option[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map(s => ({ label: s, value: s }))

// Validação com Yup
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Nome obrigatório'),
  email: Yup.string().email('Email inválido').required('Email obrigatório'),
  cpf: Yup.string()
    .required('CPF obrigatório')
    .test('valid-cpf', 'CPF inválido', v => v ? validateCPF(v) : false),
  phone: Yup.string(),
  cep: Yup.string().required('CEP obrigatório'),
  uf: Yup.string().required('UF obrigatória'),
  city: Yup.string().required('Cidade obrigatória'),
  address: Yup.string().required('Endereço obrigatório'),
})

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signOut } = useAuth()
  const { user, loading, updateUser } = useUser()
  const [editing, setEditing] = useState(false)
  const [snack, setSnack] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  })
  const { width } = useWindowDimensions()
  const CARD_WIDTH = Math.min(width * 0.9, 400)
  const [addrLoading, setAddrLoading] = useState(false)


  if (loading && !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text text70 red30>Não foi possível carregar o perfil</Text>
      </View>
    )
  }

  const initialValues = {
    name: user.name,
    email: user.email,
    cpf: user.cpf || '',
    phone: user.phone || '',
    cep: user.cep || '',
    uf: user.uf || '',
    city: user.city || '',
    address: user.address || '',
  }

  const showSnackbar = (msg: string, type: 'success' | 'error' = 'success') =>
    setSnack({ visible: true, message: msg, type })

  // Função para buscar endereço por CEP
  const handleCepChange = async (
    text: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 8)
    setFieldValue('cep', maskCEP(text))
    if (cleaned.length === 8) {
      setAddrLoading(true)
      try {
        const { uf, city, address } = await fetchAddressByCep(cleaned)
        setFieldValue('uf', uf)
        setFieldValue('city', city)
        setFieldValue('address', address)
      } catch (err: any) {
        showSnackbar(err.message, 'error')
      } finally {
        setAddrLoading(false)
      }
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { width: CARD_WIDTH }]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user.image ? (
              <Image
                source={{ uri: user.image }}
                style={[
                  styles.avatar,
                  { width: CARD_WIDTH * 0.4, height: CARD_WIDTH * 0.4, borderRadius: (CARD_WIDTH * 0.4) / 2 },
                ]}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={CARD_WIDTH * 0.4}
                color="#CCC"
              />
            )}
          </View>

          {!editing ? (
            // Modo "visualização"
            <>
              {/** linhas de informação */}
              {['name', 'email', 'cpf', 'phone', 'cep', 'uf', 'city', 'address'].map(key => {
                const labelMap: Record<string, string> = {
                  name: 'Nome', email: 'Email', cpf: 'CPF', phone: 'Telefone',
                  cep: 'CEP', uf: 'UF', city: 'Cidade', address: 'Endereço'
                }
                const value = (user as any)[key]
                if (!value) return null
                return (
                  <View style={styles.infoRow} key={key}>
                    <Text style={styles.label}>{labelMap[key]}:</Text>
                    <Text style={styles.value}>{value}</Text>
                  </View>
                )
              })}

              <View style={styles.buttonRow}>
                <Button
                  label="Editar"
                  onPress={() => setEditing(true)}
                  style={styles.button}
                />
                <Button
                  label="Sair"
                  backgroundColor={Colors.red10}
                  onPress={signOut}
                  style={styles.button}
                />
              </View>
            </>
          ) : (
            // Modo "edição"
            <Formik
              initialValues={initialValues}
              validationSchema={ProfileSchema}
              onSubmit={async (vals, { setSubmitting }) => {
                try {
                  await updateUser(vals)
                  showSnackbar('Atualizado com sucesso!', 'success')
                  setEditing(false)
                } catch (err: any) {
                  showSnackbar(err.message, 'error')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {({
                values, handleChange, setFieldValue,
                handleSubmit, errors, touched, isSubmitting
              }) => (
                <>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    value={values.name}
                    onChangeText={handleChange('name')}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

                  <Text style={styles.label}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    value={values.cpf}
                    onChangeText={t => setFieldValue('cpf', maskCPF(t))}
                    keyboardType="numeric"
                  />
                  {touched.cpf && errors.cpf && (
                    <Text style={styles.error}>{errors.cpf}</Text>
                  )}

                  <Text style={styles.label}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={values.phone}
                    onChangeText={t => setFieldValue('phone', maskPhone(t))}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.label}>CEP</Text>
                  <TextInput
                    style={styles.input}
                    value={values.cep}
                    onChangeText={t => handleCepChange(t, setFieldValue)}
                    keyboardType="numeric"
                  />
                  {addrLoading && <ActivityIndicator />}
                  {touched.cep && errors.cep && (
                    <Text style={styles.error}>{errors.cep}</Text>
                  )}

                  <Text style={styles.label}>UF</Text>
                  <AppSelect
                    options={STATES}
                    selectedValue={values.uf}
                    onValueChange={val => setFieldValue('uf', val)}
                    placeholder="Selecione UF"
                    style={styles.select}
                  />
                  {touched.uf && errors.uf && (
                    <Text style={styles.error}>{errors.uf}</Text>
                  )}

                  <Text style={styles.label}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    value={values.city}
                    onChangeText={handleChange('city')}
                  />
                  {touched.city && errors.city && (
                    <Text style={styles.error}>{errors.city}</Text>
                  )}

                  <Text style={styles.label}>Endereço</Text>
                  <TextInput
                    style={styles.input}
                    value={values.address}
                    onChangeText={handleChange('address')}
                  />
                  {touched.address && errors.address && (
                    <Text style={styles.error}>{errors.address}</Text>
                  )}

                  <View style={styles.buttonRow}>
                    <Button
                      label="Cancelar"
                      outline
                      onPress={() => setEditing(false)}
                      disabled={isSubmitting}
                      style={styles.button}
                    />
                    <Button
                      label={isSubmitting ? 'Salvando...' : 'Salvar'}
                      onPress={handleSubmit as any}
                      disabled={isSubmitting}
                      style={styles.button}
                    />
                  </View>
                </>
              )}
            </Formik>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={() => setSnack(s => ({ ...s, visible: false }))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 24,
  },
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  avatar: { backgroundColor: '#EEE' },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  label: { width: 100, fontWeight: '600', fontSize: 16 },
  value: { flex: 1, fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: '#CCC',
    borderRadius: 4, padding: 10, marginBottom: 12,
    fontSize: 16,
  },
  select: { marginBottom: 12 },
  error: { color: Colors.red30, marginBottom: 8 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: { flex: 1, marginHorizontal: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})

export default ProfileScreen
