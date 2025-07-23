import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Image, Text, Colors } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ProfileStackParamList } from '@/navigation/ProfileStack';

export const AvatarMenu: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [open, setOpen] = useState(false);

  const goToProfile = () => {
    setOpen(false);
    navigation.navigate('Profile');
  };

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.trigger}>
        {user?.image
          ? <Image source={{ uri: user.image }} style={styles.avatar} />
          : <Ionicons name="person-circle" size={32} color={Colors.grey40} />
        }
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* captura o toque fora do menu para fechar */}
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.item} onPress={goToProfile}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'person-outline' : 'person'}
              size={20}
              color={Colors.grey10}
            />
            <Text marginL-8>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={signOut}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'log-out-outline' : 'log-out'}
              size={20}
              color={Colors.grey10}
            />
            <Text marginL-8>Sair</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 42,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

