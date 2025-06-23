import React, { useEffect, useState } from 'react';
import { View, Text, Button, Colors } from 'react-native-ui-lib';
import { getProfessionalByUserId } from '../../api/professional';
import { ProfessionalProfile } from '../../types/professional';
import { useAuth } from '../../context/AuthContext';

const MyProfessionalProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const prof = await getProfessionalByUserId(user._id);
        setProfile(prof);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View flex center>
        <Text text70>Carregando...</Text>
      </View>
    );
  }

  return (
    <View flex padding-24 backgroundColor={Colors.white}>
      {profile ? (
        <>
          <Text text30 marginB-8>Meu Perfil Profissional</Text>
          <Text text70 marginB-4>Categoria: {profile.category}</Text>
          <Text text70 marginB-4>Bio: {profile.bio}</Text>
          <Text text70 marginB-4>Serviços: {profile.services.join(', ')}</Text>
          <Text text70 marginB-4>Preço: R$ {profile.price}</Text>
          <Text text70 marginB-4>Tags: {profile.tags.join(', ')}</Text>
          <Text text70 marginB-4>Atendimento: {profile.mode}</Text>

          <View marginT-24>
            <Button
              label="Editar Perfil Profissional"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('ProfessionalForm', { existingProfile: true });
              }}
            />
          </View>
        </>
      ) : (
        <>
          <Text text30 marginB-16>Você ainda não tem um perfil profissional.</Text>
          <Button
            label="Criar Perfil Profissional"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ProfessionalForm');
            }}
          />
        </>
      )}
    </View>
  );
};

export default MyProfessionalProfileScreen;
