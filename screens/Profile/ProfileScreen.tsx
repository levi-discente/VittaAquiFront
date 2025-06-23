import React, { useEffect, useState } from 'react';
import { View, Text, Button, Colors, Spacings } from 'react-native-ui-lib';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/user';
import { User } from '../../types/user';

const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState<User | null>(user);

  useEffect(() => {
    // Opcional: refazer fetch para garantir dados atualizados
    const fetchUser = async () => {
      const me = await getMe();
      setUserData(me);
    };
    fetchUser();
  }, []);

  if (!userData) {
    return (
      <View flex center>
        <Text text70>Carregando...</Text>
      </View>
    );
  }

  return (
    <View flex padding-24 backgroundColor={Colors.white}>
      <Text text30 marginB-8>Meu Perfil</Text>
      <Text text70 marginB-4>Nome: {userData.name}</Text>
      <Text text70 marginB-4>Email: {userData.email}</Text>
      <Text text70 marginB-4>Tipo: {userData.role}</Text>
      {userData.role === 'professional' && (
        <>
          <Text text70 marginB-4>Bio: {userData.bio}</Text>
          <Text text70 marginB-4>Categoria: {userData.category}</Text>
        </>
      )}

      <View marginT-24>
        <Button
          label="Editar Perfil"
          onPress={() => {
            // @ts-ignore
            navigation.navigate('EditProfile');
          }}
          marginB-16
        />
        <Button
          label="Sair"
          backgroundColor={Colors.red10}
          onPress={async () => {
            await signOut();
          }}
        />
      </View>
    </View>
  );
};

export default ProfileScreen;
