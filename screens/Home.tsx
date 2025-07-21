import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Colors, Button } from 'react-native-ui-lib';
import { listProfessionals } from '../api/professional';
import { ProfessionalProfile, ProfessionalFilter } from '../types/professional';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { AppSelect, Option } from '../components/ui/AppSelect';

const CATEGORY_OPTIONS: Option[] = [
  { label: 'Todas', value: '' },
  { label: 'Médico', value: 'doctor' },
  { label: 'Nutricionista', value: 'nutritionist' },
  { label: 'Psicólogo', value: 'psychologist' },
  { label: 'Psiquiatra', value: 'physician' },
  { label: 'Personal Trainer', value: 'personal_trainer' },
];

const PAGE_SIZE = 10;

const PatientHomeScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const PADDING = width * 0.04; // 4% de padding lateral
  const INPUT_HEIGHT = 40;

  // dados
  const [fullList, setFullList] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyPresential, setOnlyPresential] = useState(false);

  // paginação
  const [page, setPage] = useState(1);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(fullList.length / PAGE_SIZE)),
    [fullList.length]
  );
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return fullList.slice(start, start + PAGE_SIZE);
  }, [fullList, page]);

  // busca
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
    fetchProfessionals({
      name: search,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
      only_online: onlyOnline,
      only_presential: onlyPresential,
    });
  };

  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.filterPanel, { padding: PADDING }]}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, category === opt.value && styles.chipActive, { height: INPUT_HEIGHT, marginRight: PADDING * 0.5 }]}
              onPress={() => {
                const newCategory = opt.value;
                setCategory(newCategory);
                setPage(1);
                fetchProfessionals({
                  name: search,
                  category: newCategory,
                  tags: tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
                  ...(onlyOnline ? { only_online: true } : {}),
                  ...(onlyPresential ? { only_presential: true } : {}),
                });
              }}
            >
              <Text style={[styles.chipText, category === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                height: INPUT_HEIGHT,
                marginRight: PADDING * 0.5,
              },
            ]}
            placeholder="Buscar por nome..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={applyFilters}
          />
          <Button
            label="OK"
            outline
            onPress={applyFilters}
            style={{ height: INPUT_HEIGHT }}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                height: INPUT_HEIGHT,
                marginRight: PADDING * 0.5,
              },
            ]}
            placeholder="Tags (vírgula)"
            value={tags}
            onChangeText={setTags}
            onSubmitEditing={applyFilters}
          />
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleChip,
                onlyOnline && styles.toggleChipActive,
                { height: INPUT_HEIGHT },
              ]}
              onPress={() => setOnlyOnline(v => !v)}
            >
              <Text
                style={[
                  styles.toggleText,
                  onlyOnline && styles.toggleTextActive,
                ]}
              >
                Online
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleChip,
                onlyPresential && styles.toggleChipActive,
                { height: INPUT_HEIGHT, marginLeft: PADDING * 0.5 },
              ]}
              onPress={() => setOnlyPresential(v => !v)}
            >
              <Text
                style={[
                  styles.toggleText,
                  onlyPresential && styles.toggleTextActive,
                ]}
              >
                Presencial
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: PADDING }}
          data={paginated}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <ProfessionalCard profile={item} />}
          refreshing={loading}
          onRefresh={applyFilters}
        />
      )}

      {!loading && !error && (
        <View style={[styles.pagination, { paddingHorizontal: PADDING }]}>
          <TouchableOpacity
            disabled={page <= 1}
            onPress={() => setPage(p => Math.max(1, p - 1))}
            style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
          >
            <Text style={styles.pageButtonText}>Anterior</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>
            {page} / {totalPages}
          </Text>
          <TouchableOpacity
            disabled={page >= totalPages}
            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
            style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
          >
            <Text style={styles.pageButtonText}>Próxima</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  filterPanel: {
    backgroundColor: '#FFF',
    elevation: 2,
  },
  chipScroll: {
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.blue30,
  },
  chipText: {
    fontSize: 14,
    color: '#555',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  toggleGroup: {
    flexDirection: 'row',
  },
  toggleChip: {
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD',
    justifyContent: 'center',
  },
  toggleChipActive: {
    backgroundColor: Colors.green30,
    borderColor: Colors.green30,
  },
  toggleText: {
    fontSize: 14,
    color: '#555',
  },
  toggleTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: Colors.red30,
    marginTop: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: Colors.blue30,
  },
  pageButtonDisabled: {
    backgroundColor: Colors.grey40,
  },
  pageButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
  },
});

export default PatientHomeScreen;

