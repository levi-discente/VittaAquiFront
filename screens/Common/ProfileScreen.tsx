import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
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

// Lista de UFs
const STATES: Option[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map(s => ({ label: s, value: s }))

// **ProfileSchema** mantido aqui no topo
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

const ProfileScreen: React.FC = () => {
  const { signOut } = useAuth()
  const { user, loading, updateUser } = useUser()
  const [editing, setEditing] = useState(false)
  const [snack, setSnack] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })
  const [addrLoading, setAddrLoading] = useState(false)
  const { width } = useWindowDimensions()
  const isWide = width >= 600

  useEffect(() => {
    if (!loading && !user) {
      setSnack({ visible: true, message: 'Não foi possível carregar o perfil', type: 'error' })
    }
  }, [loading, user])

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
        <Text text70 red30>Perfil não disponível</Text>
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

  const showSnack = (message: string, type: 'success' | 'error' = 'success') => {
    setSnack({ visible: true, message, type })
  }

  const handleCepChange = async (text: string, setFieldValue: (f: string, v: any) => void) => {
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
        showSnack(err.message, 'error')
      } finally {
        setAddrLoading(false)
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, isWide && styles.headerWide]}>
        {user.image
          ? <Image source={{ uri: user.image }} style={styles.avatar(isWide)} />
          : <Ionicons
            name="person-circle-outline"
            size={isWide ? 120 : 100}
            color={Colors.grey40}
            style={styles.avatar(isWide)}
          />
        }
        <View style={[styles.headerText, isWide && { alignItems: 'flex-start' }]}>
          <Text text40 white marginB-4>{user.name}</Text>
          <Text text90 white>{user.email}</Text>
        </View>
      </View>

      {/** Se não estiver editando, mostre só os dados e ações padrão */}
      {!editing ? (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {[
              ['CPF', user.cpf],
              ['Telefone', user.phone],
              ['CEP', user.cep],
              ['UF', user.uf],
              ['Cidade', user.city],
              ['Endereço', user.address],
            ].map(([label, value]) =>
              value ? (
                <View style={styles.row} key={label as string}>
                  <Text text90 grey40 style={styles.rowLabel}>{label}:</Text>
                  <Text text70>{value}</Text>
                </View>
              ) : null
            )}
          </ScrollView>
          <View style={[styles.footer, isWide && styles.footerWide]}>
            <TouchableOpacity style={styles.footerBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={20} color={Colors.blue30} />
              <Text marginL-8 blue30>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerBtn} onPress={signOut}>
              <Ionicons name="exit-outline" size={20} color={Colors.red30} />
              <Text marginL-8 red30>Sair</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /** Se estiver editando, envolva inputs e footer num Formik */
        <Formik
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={async (vals, { setSubmitting }) => {
            try {
              await updateUser(vals)
              showSnack('Perfil atualizado!', 'success')
              setEditing(false)
            } catch (err: any) {
              showSnack(err.message, 'error')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({
            values,
            handleChange,
            setFieldValue,
            handleSubmit,
            errors,
            touched,
            isSubmitting,
          }) => (
            <>
              <ScrollView contentContainerStyle={styles.content}>
                {[
                  { key: 'name', label: 'Nome', keyboard: 'default', mask: null },
                  { key: 'email', label: 'Email', keyboard: 'email-address', mask: null },
                  { key: 'cpf', label: 'CPF', keyboard: 'numeric', mask: maskCPF },
                  { key: 'phone', label: 'Telefone', keyboard: 'phone-pad', mask: maskPhone },
                ].map(({ key, label, keyboard, mask }) => (
                  <View style={styles.inputGroup} key={key}>
                    <Text text90 grey40 style={styles.label}>{label}</Text>
                    <TextInput
                      style={styles.input}
                      value={(values as any)[key]}
                      keyboardType={keyboard as any}
                      onChangeText={text =>
                        mask
                          ? setFieldValue(key, mask(text))
                          : handleChange(key)(text)
                      }
                    />
                    {touched[key] && errors[key] && (
                      <Text text90 red30>{(errors as any)[key]}</Text>
                    )}
                  </View>
                ))}

                {/* CEP com busca automática */}
                <View style={styles.inputGroup}>
                  <Text text90 grey40 style={styles.label}>CEP</Text>
                  <TextInput
                    style={styles.input}
                    value={values.cep}
                    keyboardType="numeric"
                    onChangeText={t => handleCepChange(t, setFieldValue)}
                  />
                  {addrLoading && <ActivityIndicator />}
                  {touched.cep && errors.cep && (
                    <Text text90 red30>{errors.cep}</Text>
                  )}
                </View>

                {/* UF */}
                <View style={styles.inputGroup}>
                  <Text text90 grey40 style={styles.label}>UF</Text>
                  <AppSelect
                    options={STATES}
                    selectedValue={values.uf}
                    onValueChange={val => setFieldValue('uf', val)}
                    placeholder="Selecione UF"
                  />
                  {touched.uf && errors.uf && (
                    <Text text90 red30>{errors.uf}</Text>
                  )}
                </View>

                {/* Cidade e Endereço */}
                {['city', 'address'].map(k => (
                  <View style={styles.inputGroup} key={k}>
                    <Text text90 grey40 style={styles.label}>
                      {k === 'city' ? 'Cidade' : 'Endereço'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={(values as any)[k]}
                      onChangeText={handleChange(k)}
                    />
                    {touched[k] && (errors as any)[k] && (
                      <Text text90 red30>{(errors as any)[k]}</Text>
                    )}
                  </View>
                ))}

                <View style={{ height: 60 }} />
              </ScrollView>

              <View style={[styles.footer, isWide && styles.footerWide]}>
                <Button
                  label="Cancelar"
                  outline
                  disabled={isSubmitting}
                  onPress={() => setEditing(false)}
                  style={styles.btn}
                />
                <Button
                  label={isSubmitting ? 'Salvando...' : 'Salvar'}
                  onPress={handleSubmit as any}
                  disabled={isSubmitting}
                  style={styles.btn}
                />
              </View>
            </>
          )}
        </Formik>
      )}

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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 8,            // não gruda na borda
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: Colors.blue30,
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avatar: (isWide: boolean) => ({
    width: isWide ? 120 : 100,
    height: isWide ? 120 : 100,
    borderRadius: (isWide ? 120 : 100) / 2,
    marginRight: isWide ? 16 : 0,
    marginBottom: isWide ? 0 : 16,
  }),
  headerText: {
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey70,
  },
  rowLabel: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey40,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.grey70,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  footerWide: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  btn: {
    marginLeft: 12,
  },
})

export default ProfileScreen

