import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Button, Colors } from 'react-native-ui-lib';
import { listProfessionals } from '../api/professional';
import { ProfessionalProfile, ProfessionalFilter } from '../types/professional';
import { AppSelect, Option } from '../components/ui/AppSelect';
import { ProfessionalCard } from '@/components/ProfessionalCard';

const CATEGORY_OPTIONS: Option[] = [
  { label: 'Todas', value: '' },
  { label: 'Médico', value: 'doctor' },
  { label: 'Nutricionista', value: 'nutritionist' },
  { label: 'Psicólogo', value: 'psychologist' },
  { label: 'Psiquiatra', value: 'physician' },
  { label: 'Personal Trainer', value: 'personal_trainer' },
];

const PAGE_SIZE = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;
const INPUT_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

const PatientHomeScreen: React.FC = () => {
  const [fullList, setFullList] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyPresential, setOnlyPresential] = useState(false);

  // paginação
  const [page, setPage] = useState(1);
  const totalPages = useMemo(
    () => Math.ceil(fullList.length / PAGE_SIZE) || 1,
    [fullList.length]
  );

  const paginatedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return fullList.slice(start, start + PAGE_SIZE);
  }, [fullList, page]);

  const fetchProfessionals = useCallback(async (filters: ProfessionalFilter) => {
    setLoading(true);
    setError(null);
    try {
      const list = await listProfessionals(filters);
      setFullList(list);
      setPage(1);
    } catch {
      setError('Erro ao buscar profissionais');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = () => {
    const filters: ProfessionalFilter = {
      name: nameFilter,
      category: categoryFilter,
      tags: tagsFilter.split(',').map(t => t.trim()).filter(t => t).join(','),
      only_online: onlyOnline,
      only_presential: onlyPresential,
    };
    fetchProfessionals(filters);
  };

  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nome..."
          value={nameFilter}
          onChangeText={setNameFilter}
        />
        <AppSelect
          options={CATEGORY_OPTIONS}
          selectedValue={categoryFilter}
          onValueChange={setCategoryFilter}
          placeholder="Categoria"
        />
        <TextInput
          style={styles.input}
          placeholder="Tags (vírgula)"
          value={tagsFilter}
          onChangeText={setTagsFilter}
        />
        <View style={styles.switchRow}>
          <View style={styles.switchItem}>
            <Switch value={onlyOnline} onValueChange={setOnlyOnline} />
            <Text style={styles.switchLabel}>Online</Text>
          </View>
          <View style={[styles.switchItem, { marginLeft: 16 }]}>
            <Switch value={onlyPresential} onValueChange={setOnlyPresential} />
            <Text style={styles.switchLabel}>Presencial</Text>
          </View>
        </View>
        <Button
          label="Aplicar filtros"
          onPress={applyFilters}
          loading={loading}
          style={styles.filterButton}
        />
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <FlatList
            data={paginatedList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ProfessionalCard profile={item} />}
            refreshing={loading}
            onRefresh={applyFilters}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={page <= 1}
              onPress={() => setPage(p => Math.max(1, p - 1))}
              style={[
                styles.pageButton,
                page <= 1 && styles.pageButtonDisabled
              ]}
            >
              <Text style={styles.pageButtonText}>Anterior</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              Página {page} de {totalPages}
            </Text>
            <TouchableOpacity
              disabled={page >= totalPages}
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              style={[
                styles.pageButton,
                page >= totalPages && styles.pageButtonDisabled
              ]}
            >
              <Text style={styles.pageButtonText}>Próxima</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  filters: {
    padding: 16,
    alignItems: 'center',
  },
  input: {
    width: INPUT_WIDTH,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  switchRow: { flexDirection: 'row', marginBottom: 12 },
  switchItem: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { marginLeft: 8, fontSize: 16 },
  filterButton: { marginTop: 8, width: INPUT_WIDTH },
  errorText: {
    textAlign: 'center',
    color: 'red',
    margin: 20,
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  pageButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pageInfo: {
    marginHorizontal: 12,
    fontSize: 16,
  },
});

export default PatientHomeScreen;

