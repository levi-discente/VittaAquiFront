import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Text, Card, Button, Colors, TextField } from 'react-native-ui-lib';
import { ProfessionalProfile, ProfessionalFilter } from '../../types/professional';
import { listProfessionals } from '../../api/professional';

const ProfessionalListScreen: React.FC = () => {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchName, setSearchName] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('');

  const fetchProfessionals = async (filters: ProfessionalFilter = {}) => {
    setLoading(true);
    try {
      const list = await listProfessionals(filters);
      setProfessionals(list);
    } catch {
      // lidar com erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleSearch = () => {
    fetchProfessionals({ name: searchName, category: searchCategory });
  };

  const renderItem = ({ item }: { item: ProfessionalProfile }) => (
    <Card containerStyle={styles.card}>
      <Text text70>{item.name}</Text>
      <Text text80 color={Colors.grey40}>
        {item.category}
      </Text>
      <Button label="Ver Detalhes" link marginT-8 />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextField
          placeholder="Nome"
          value={searchName}
          onChangeText={setSearchName}
          style={styles.inputSearch}
        />
        <TextField
          placeholder="Categoria"
          value={searchCategory}
          onChangeText={setSearchCategory}
          style={[styles.inputSearch, { marginLeft: 8 }]}
        />
        <Button label="Buscar" onPress={handleSearch} marginT-8 />
      </View>

      <FlatList
        data={professionals}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={() => fetchProfessionals({ name: searchName, category: searchCategory })}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  searchContainer: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  inputSearch: { flex: 1 },
  card: { marginBottom: 12, padding: 16 },
});

export default ProfessionalListScreen;
