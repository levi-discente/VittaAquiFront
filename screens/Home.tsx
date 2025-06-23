import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Card, Colors, Button } from 'react-native-ui-lib';
import { getMe } from '../api/user';
import { ProfessionalProfile } from '@/types/professional';
import { listProfessionals } from '@/api/professional';

const HomeScreen: React.FC = () => {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const list = await listProfessionals({}); // sem filtros iniciais
        setProfessionals(list);
      } catch {
        // trate erros se precisar
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const renderItem = ({ item }: { item: ProfessionalProfile }) => (
    <Card containerStyle={styles.card}>
      <Text text70>{item.name}</Text>
      <Text text80 color={Colors.grey40}>
        {item.category}
      </Text>
      <Text text90 marginT-4>
        {item.bio.slice(0, 60)}...
      </Text>
      <Button label="Ver Perfil" link marginT-8 />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text text50 margin-16>
        Profissionais
      </Text>
      <FlatList
        data={professionals}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onRefresh={() => {/* refetch se quiser pull to refresh */ }}
        refreshing={loading}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  card: {
    marginBottom: 12,
    padding: 16,
  },
});

export default HomeScreen;
