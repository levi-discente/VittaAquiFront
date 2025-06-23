import React, { useState, useEffect } from 'react';
import { View, Text, TextField, Button, Colors, Checkbox, Spacings } from 'react-native-ui-lib';
import {
  createProfessionalProfile,
  getProfessionalByUserId,
  updateProfessionalProfile
} from '../../api/professional';
import { ProfessionalProfile } from '../../types/professional';
import { useAuth } from '../../context/AuthContext';

interface Props {
  route: {
    params?: {
      existingProfile?: boolean;
    };
  };
  navigation: any;
}

const ProfessionalFormScreen = ({ route, navigation }: Props) => {
  const { existingProfile = false } = route.params || {};
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<Partial<ProfessionalProfile>>({
    bio: '',
    category: '',
    services: [''],
    price: 0,
    tags: [''],
    mode: 'online',
    userId: user?._id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingProfile && user) {
      // carrega dados
      const fetchProfile = async () => {
        try {
          const prof = await getProfessionalByUserId(user._id);
          setProfileData(prof);
        } catch {
          // se não existir, deixe em branco
        }
      };
      fetchProfile();
    }
  }, [existingProfile, user]);

  const handleSubmit = async () => {
    setError(null);
    // Validações básicas
    if (
      !profileData.bio ||
      !profileData.category ||
      !profileData.services?.length ||
      !profileData.price ||
      !profileData.tags?.length
    ) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      if (existingProfile && profileData._id) {
        await updateProfessionalProfile(profileData._id, profileData as ProfessionalProfile);
      } else {
        await createProfessionalProfile(profileData as ProfessionalProfile);
      }
      navigation.goBack();
    } catch (err) {
      console.log(err);
      setError('Erro ao salvar perfil profissional.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View flex padding-24 backgroundColor={Colors.white}>
      <Text text30 marginB-16>
        {existingProfile ? 'Editar Perfil Profissional' : 'Criar Perfil Profissional'}
      </Text>

      <TextField
        floatingPlaceholder
        placeholder="Categoria (ex.: Nutricionista)"
        text70
        onChangeText={(text) => setProfileData({ ...profileData, category: text })}
        value={profileData.category}
        marginB-16
      />

      <TextField
        floatingPlaceholder
        placeholder="Breve descrição (bio)"
        text70
        onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
        value={profileData.bio}
        marginB-16
      />

      <TextField
        floatingPlaceholder
        placeholder="Serviços (separe por vírgula)"
        text70
        onChangeText={(text) =>
          setProfileData({ ...profileData, services: text.split(',').map((s) => s.trim()) })
        }
        value={profileData.services?.join(', ')}
        marginB-16
      />

      <TextField
        floatingPlaceholder
        placeholder="Preço (somente número)"
        text70
        keyboardType="numeric"
        onChangeText={(text) => setProfileData({ ...profileData, price: Number(text) })}
        value={profileData.price ? String(profileData.price) : ''}
        marginB-16
      />

      <TextField
        floatingPlaceholder
        placeholder="Tags (ex.: emagrecimento, esportivo)"
        text70
        onChangeText={(text) =>
          setProfileData({ ...profileData, tags: text.split(',').map((s) => s.trim()) })
        }
        value={profileData.tags?.join(', ')}
        marginB-16
      />

      <Text text80 marginB-8>Modo de atendimento:</Text>
      <Checkbox
        label="Online"
        value={profileData.mode === 'online'}
        onValueChange={() => setProfileData({ ...profileData, mode: 'online' })}
        marginB-8
      />
      <Checkbox
        label="Presencial"
        value={profileData.mode === 'presencial'}
        onValueChange={() => setProfileData({ ...profileData, mode: 'presencial' })}
        marginB-16
      />

      {error && (
        <Text text80 red20 marginB-16>
          {error}
        </Text>
      )}

      <Button
        label={loading ? 'Salvando...' : 'Salvar'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};

export default ProfessionalFormScreen;
