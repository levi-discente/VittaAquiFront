import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalProfileByUserId } from '@/hooks/useProfessionals';
import { isProfileIncomplete } from '@/utils/professional';
import { useNavigation } from 'expo-router';

const ProfessionalHomeScreen = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfessionalProfileByUserId(Number(user?.id) ?? 0);
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && profile && isProfileIncomplete(profile)) {
      navigation.replace('ConfigProfile');
    }
  }, [profile, loading]);

  return (
    <View style={{ padding: 16 }}>
      <Text>Tela inicial do profissional</Text>
    </View>
  );
};

export default ProfessionalHomeScreen;

