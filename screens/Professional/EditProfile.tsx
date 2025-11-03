import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Colors, Card, Button } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Snackbar from '@/components/Snackbar';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalProfileByUserId } from '@/hooks/useProfessionals';
import { isProfileIncomplete } from '@/utils/professional';
import { updateProfessionalProfile } from '@/api/professional';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';

const validationSchema = Yup.object().shape({
  bio: Yup.string().required('A bio é obrigatória'),
  price: Yup.number().min(0, 'Preço inválido').required('Preço obrigatório'),
  startHour: Yup.string().required('Informe o horário de início'),
  endHour: Yup.string().required('Informe o horário de fim'),
});

const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

const EditProfileScreen = () => {
  const { user } = useAuth();
  const { profile, loading, refresh } = useProfessionalProfileByUserId(Number(user?.id) ?? 0);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (profile && isProfileIncomplete(profile)) {
      Snackbar.show({ text: 'Por favor, complete seu perfil profissional', type: 'warning' });
    }
  }, [profile]);

  if (loading) return <ActivityIndicator size="large" color={Colors.blue30} style={{ marginTop: 50 }} />;
  if (!profile) return <Text>Perfil não encontrado</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Formik
        enableReinitialize
        initialValues={{
          bio: profile.bio || '',
          category: profile.category || '',
          profissionalIdentification: profile.profissionalIdentification || '',
          services: Array.isArray(profile.services) ? profile.services.join(', ') : profile.services || '',
          price: profile.price || 0,
          tags: profile.tags || [],
          onlyOnline: profile.onlyOnline || false,
          onlyPresential: profile.onlyPresential || false,
          address: profile.address || '',
          city: profile.city || '',
          uf: profile.uf || '',
          cep: profile.cep || '',
          startHour: profile.startHour || '',
          endHour: profile.endHour || '',
          availableDaysOfWeek: (profile.availableDaysOfWeek || []).filter(Boolean),
          unavailableDates: profile.unavailableDates || [],
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const payload = {
            bio: values.bio,
            category: values.category,
            profissional_identification: values.profissionalIdentification,
            services: values.services,
            price: Number(values.price),
            tags: values.tags || [],
            only_online: values.onlyOnline,
            only_presential: values.onlyPresential,
            address: values.address,
            city: values.city,
            uf: values.uf,
            cep: values.cep,
            start_hour: values.startHour.trim(),
            end_hour: values.endHour.trim(),
            available_days_of_week: (values.availableDaysOfWeek || []).join(','),
            unavailable_dates: (values.unavailableDates || []).map(d => ({
              date: d.date,
              reason: d.reason || 'Indisponível'
            }))
          };

          console.log('ENVIANDO PAYLOAD →', payload);
          try {
            await updateProfessionalProfile(profile.id, payload);
            Snackbar.show({ text: 'Perfil atualizado com sucesso!', type: 'success' });
            refresh();
          } catch (err: any) {
            console.error('ERRO BACKEND →', err);
            Snackbar.show({ text: err.message || 'Erro ao atualizar', type: 'error' });
          }
        }}
      >
        {({ handleChange, handleSubmit, values, setFieldValue, errors }) => (
          <View>

            {/* ==== CAMPOS FIXOS ==== */}
            <Card style={styles.card}><Text style={styles.label}>Nome</Text><Text>{profile.userName}</Text></Card>
            <Card style={styles.card}><Text style={styles.label}>Email</Text><Text>{profile.email}</Text></Card>
            <Card style={styles.card}><Text style={styles.label}>Telefone</Text><Text>{profile.phone}</Text></Card>

            {/* ==== BIO ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Bio</Text>
              <TextInput style={styles.input} value={values.bio} onChangeText={handleChange('bio')} />
              {errors.bio && <Text style={styles.error}>{errors.bio}</Text>}
            </Card>

            {/* ==== CATEGORIA & IDENTIFICAÇÃO ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Categoria</Text>
              <TextInput style={styles.input} value={values.category} onChangeText={handleChange('category')} />
              <Text style={styles.label}>Registro Profissional</Text>
              <TextInput style={styles.input} value={values.profissionalIdentification} onChangeText={handleChange('profissionalIdentification')} />
            </Card>

            {/* ==== SERVIÇOS ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Serviços (separados por vírgula)</Text>
              <TextInput style={styles.input} value={values.services} onChangeText={handleChange('services')} />
            </Card>

            {/* ==== PREÇO ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Preço</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={String(values.price)} onChangeText={handleChange('price')} />
              {errors.price && <Text style={styles.error}>{errors.price}</Text>}
            </Card>

            {/* ==== ATENDIMENTO ==== */}
            <Card style={styles.card}>
              <View style={styles.row}><Text>Atende Online?</Text><Switch value={values.onlyOnline} onValueChange={v => setFieldValue('onlyOnline', v)} /></View>
              <View style={styles.row}><Text>Atende Presencial?</Text><Switch value={values.onlyPresential} onValueChange={v => setFieldValue('onlyPresential', v)} /></View>
            </Card>

            {/* ==== ENDEREÇO ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput style={styles.input} value={values.address} onChangeText={handleChange('address')} />
              <TextInput style={styles.input} placeholder="Cidade" value={values.city} onChangeText={handleChange('city')} />
              <TextInput style={styles.input} placeholder="UF" value={values.uf} onChangeText={handleChange('uf')} />
              <TextInput style={styles.input} placeholder="CEP" value={values.cep} onChangeText={handleChange('cep')} />
            </Card>

            {/* ==== HORÁRIOS ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Horários</Text>
              <TextInput style={styles.input} placeholder="Início (HH:MM)" value={values.startHour} onChangeText={handleChange('startHour')} />
              <TextInput style={styles.input} placeholder="Fim (HH:MM)" value={values.endHour} onChangeText={handleChange('endHour')} />
              {(errors.startHour || errors.endHour) && <Text style={styles.error}>{errors.startHour || errors.endHour}</Text>}
            </Card>

            {/* ==== DIAS DISPONÍVEIS ==== */}
            <Card style={styles.card}>
              <Text style={styles.label}>Dias de Atendimento</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => {
                  const active = values.availableDaysOfWeek.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayChip, active && styles.dayActive]}
                      onPress={() => {
                        const newDays = active
                          ? values.availableDaysOfWeek.filter(d => d !== day)
                          : [...values.availableDaysOfWeek, day];
                        setFieldValue('availableDaysOfWeek', newDays);
                      }}
                    >
                      <Text style={{ color: active ? '#fff' : '#000' }}>{day.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* ==== BOTÃO SALVAR ==== */}
            <Button label="Salvar Alterações" onPress={handleSubmit} backgroundColor={Colors.green30} marginT-16 />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12 },
  label: { fontWeight: '700', fontSize: 16, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  input: { borderWidth: 1, borderColor: Colors.grey50, padding: 8, borderRadius: 6, marginBottom: 4 },
  error: { color: Colors.red30, fontSize: 12, marginBottom: 4 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  dayChip: { borderWidth: 1, borderColor: Colors.grey50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, margin: 4 },
  dayActive: { backgroundColor: Colors.blue30, borderColor: Colors.blue30 },
});

export default EditProfileScreen;

