import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Text as RNText,
  Modal,
} from 'react-native';
import { Colors, Button } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { listProfessionals } from '@/api/professional';
import { ProfessionalFilter, ProfessionalProfile } from '@/types/professional';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Home'>;

const CATEGORY_OPTIONS = [
  { label: 'Todas', value: '' },
  { label: 'Médico', value: 'doctor' },
  { label: 'Nutricionista', value: 'nutritionist' },
  { label: 'Psicólogo', value: 'psychologist' },
  { label: 'Fisioterapeuta', value: 'physiotherapist' },
  { label: 'Personal Trainer', value: 'personal_trainer' },
];

const PAGE_SIZE = 10;
const CARD_MAX_WIDTH = 400;

const PatientHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const PADDING = width * 0.04;

  const columns = useMemo(() => {
    const avail = width - PADDING * 2;
    return Math.max(1, Math.floor(avail / (CARD_MAX_WIDTH + PADDING)));
  }, [width]);
  const singleCardWidth = useMemo(() => {
    const avail = width - PADDING * 2;
    return Math.min(avail, CARD_MAX_WIDTH);
  }, [width]);

  const [fullList, setFullList] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyPresential, setOnlyPresential] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(fullList.length / PAGE_SIZE)),
    [fullList.length]
  );
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return fullList.slice(start, start + PAGE_SIZE);
  }, [fullList, page]);

  const fetchProfessionals = useCallback(
    async (filters: ProfessionalFilter) => {
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
    },
    []
  );

  const applyFilters = useCallback(() => {
    fetchProfessionals({
      name: search,
      category,
      tags: tags.join(','),
      only_online: onlyOnline,
      only_presential: onlyPresential,
    });
  }, [search, category, tags, onlyOnline, onlyPresential, fetchProfessionals]);

  useEffect(() => {
    applyFilters();
  }, []);

  // modal state + local tags input
  const [filterVisible, setFilterVisible] = useState(false);
  const [tagsInput, setTagsInput] = useState(tags.join(','));

  const openFilterModal = () => {
    setTagsInput(tags.join(','));
    setFilterVisible(true);
  };
  const onApplyModal = () => {
    const newTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    setTags(newTags);
    setFilterVisible(false);
    applyFilters();
  };
  const onCancelModal = () => {
    setFilterVisible(false);
  };
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setTimeout(applyFilters, 0);
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.blue30} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ===== filtros ===== */}
      <View style={{ padding: PADDING, backgroundColor: '#FFF', elevation: 2 }}>
        {/* categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {CATEGORY_OPTIONS.map(opt => {
            const active = category === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                  { marginRight: PADDING * 0.5 },
                ]}
                onPress={() => {
                  setCategory(opt.value);
                  applyFilters();
                }}
              >
                <RNText
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {opt.label}
                </RNText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* busca + filtro */}
        <View style={[styles.searchRow, { marginTop: 8 }]}>
          <TextInput
            style={[styles.input, { flex: 1, height: 40 }]}
            placeholder="Buscar por nome..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={applyFilters}
          />
          <Button
            label="Buscar"
            outline
            style={{ marginLeft: 8 }}
            onPress={applyFilters}
          />
          <TouchableOpacity
            style={{ marginLeft: 8, padding: 8 }}
            onPress={openFilterModal}
          >
            <Ionicons name="filter" size={24} color={Colors.grey40} />
          </TouchableOpacity>
        </View>

        {/* badges */}
        {(onlyOnline || onlyPresential || tags.length > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {onlyOnline && (
              <View style={styles.badge}>
                <RNText style={styles.badgeText}>Online</RNText>
                <TouchableOpacity onPress={() => { setOnlyOnline(false); applyFilters(); }}>
                  <Ionicons name="close" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {onlyPresential && (
              <View style={[styles.badge, { backgroundColor: Colors.green30 }]}>
                <RNText style={styles.badgeText}>Presencial</RNText>
                <TouchableOpacity onPress={() => { setOnlyPresential(false); applyFilters(); }}>
                  <Ionicons name="close" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}
            {tags.map(tag => (
              <View style={styles.badge} key={tag}>
                <RNText style={styles.badgeText}>{tag}</RNText>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Ionicons name="close" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ===== lista responsiva ===== */}
      {error ? (
        <RNText style={styles.errorText}>{error}</RNText>
      ) : (
        <FlatList
          data={paginated}
          keyExtractor={i => i.id}
          numColumns={columns}
          columnWrapperStyle={
            columns > 1
              ? { justifyContent: 'space-between', paddingHorizontal: PADDING }
              : undefined
          }
          contentContainerStyle={[
            { paddingTop: 12, paddingBottom: 24 },
            columns === 1 ? { alignItems: 'center' } : undefined,
          ]}
          renderItem={({ item }) => (
            <View
              style={
                columns === 1
                  ? { width: singleCardWidth, marginBottom: 16 }
                  : { flex: 1, maxWidth: CARD_MAX_WIDTH, marginBottom: 16 }
              }
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProfessionalDetail', {
                    profileId: item.id,
                  })
                }
              >
                <ProfessionalCard profile={item} />
              </TouchableOpacity>
            </View>
          )}
          refreshing={loading}
          onRefresh={applyFilters}
        />
      )}

      {/* ===== paginação ===== */}
      {!loading && !error && (
        <View style={[styles.pagination, { paddingHorizontal: PADDING }]}>
          <TouchableOpacity
            disabled={page <= 1}
            onPress={() => setPage(p => Math.max(1, p - 1))}
            style={[
              styles.pageButton,
              page <= 1 && styles.pageButtonDisabled,
            ]}
          >
            <RNText style={styles.pageButtonText}>Anterior</RNText>
          </TouchableOpacity>
          <RNText style={styles.pageInfo}>
            {page} / {totalPages}
          </RNText>
          <TouchableOpacity
            disabled={page >= totalPages}
            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
            style={[
              styles.pageButton,
              page >= totalPages && styles.pageButtonDisabled,
            ]}
          >
            <RNText style={styles.pageButtonText}>Próxima</RNText>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== modal de filtros ===== */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={onCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RNText style={styles.modalTitle}>Filtros</RNText>
            <View style={styles.modalRow}>
              <RNText>Online</RNText>
              <TouchableOpacity
                onPress={() => setOnlyOnline(v => !v)}
                style={[
                  styles.switch,
                  onlyOnline && styles.switchActive,
                ]}
              >
                <Ionicons
                  name={onlyOnline ? 'checkmark' : 'ellipse-outline'}
                  size={20}
                  color={onlyOnline ? '#fff' : Colors.grey40}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalRow}>
              <RNText>Presencial</RNText>
              <TouchableOpacity
                onPress={() => setOnlyPresential(v => !v)}
                style={[
                  styles.switch,
                  onlyPresential && styles.switchActive,
                ]}
              >
                <Ionicons
                  name={onlyPresential ? 'checkmark' : 'ellipse-outline'}
                  size={20}
                  color={onlyPresential ? '#fff' : Colors.grey40}
                />
              </TouchableOpacity>
            </View>
            <RNText
              style={styles.modalInput}
              placeholder="Tags (vírgula)"
              value={tagsInput}
              onChangeText={setTagsInput}
              returnKeyType="done"
            />
            <View style={styles.modalButtons}>
              <Button label="Cancelar" outline onPress={onCancelModal} />
              <Button label="Aplicar" onPress={onApplyModal} style={{ marginLeft: 12 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.blue30 },
  chipText: { fontSize: 14, color: '#555' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    height: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue30,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: { color: '#FFF', fontSize: 12 },
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
  pageButtonDisabled: { backgroundColor: Colors.grey40 },
  pageButtonText: { color: '#FFF', fontSize: 14 },
  pageInfo: { fontSize: 14, color: '#333' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switch: {
    width: 32,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: Colors.green30,
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    height: 40,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
});

export default PatientHomeScreen;

