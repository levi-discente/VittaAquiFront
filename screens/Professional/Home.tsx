import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalProfileByUserId } from '@/hooks/useProfessionals';
import { isProfileIncomplete } from '@/utils/professional';
import { router } from 'expo-router';

const ProfessionalHomeScreen = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfessionalProfileByUserId(Number(user?.id) ?? 0);

  useEffect(() => {
    if (!loading && profile && isProfileIncomplete(profile)) {
      const timer = setTimeout(() => {
        if ((router as any).isReady) {
          router.replace('/professional/edit-profile');
        }
      }, 0); // Adiciona ao final da queue de renderização
      return () => clearTimeout(timer);
    }
  }, [profile, loading]);

  return (
    <View style={{ padding: 16 }}>
      <Text>Tela inicial do profissional</Text>
    </View>
  );
};

export default ProfessionalHomeScreen;

