import React, { useState, useEffect } from 'react';
import { View, Text, TextField, Button, Colors } from 'react-native-ui-lib';
import { getMe, updateMe } from '../../api/user';
import { User } from '../../types/user';

const EditProfileScreen = ({ navigation }: any) => {
  const [userData, setUserData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const me = await getMe();
      setUserData(me);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!userData.name || !userData.email) {
        setError('Nome e email não podem ficar vazios.');
        setLoading(false);
        return;
      }
      await updateMe(userData as User);
      navigation.goBack();
    } catch (err) {
      console.log(err);
      setError('Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View flex padding-24 backgroundColor={Colors.white}>
      <Text text30 marginB-16>Editar Perfil</Text>

      <TextField
        floatingPlaceholder
        placeholder="Nome completo"
        text70
        onChangeText={(text) => setUserData({ ...userData, name: text })}
        value={userData.name}
        marginB-16
      />
      <TextField
        floatingPlaceholder
        placeholder="Email"
        text70
        onChangeText={(text) => setUserData({ ...userData, email: text })}
        value={userData.email}
        marginB-16
      />

      {error && (
        <Text text80 red20 marginB-16>
          {error}
        </Text>
      )}

      <Button
        label={loading ? 'Salvando...' : 'Salvar'}
        onPress={handleSave}
        disabled={loading}
      />
    </View>
  );
};

export default EditProfileScreen;
