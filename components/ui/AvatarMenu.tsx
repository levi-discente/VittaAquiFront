import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Text, Colors } from "react-native-ui-lib";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { ProfileStackParamList } from "@/navigation/ProfileStack";
import { Avatar } from "./Avatar";

interface AvatarMenuProps {
  imageUrl?: string;
  size?: number;
}

export const AvatarMenu: React.FC<AvatarMenuProps> = ({
  imageUrl,
  size = 32,
}) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const [open, setOpen] = useState(false);

  const goToProfile = () => {
    setOpen(false);
    navigation.navigate("Profile");
  };

  return (
    <>
      <View style={styles.trigger}>
        <Avatar
          imageUrl={imageUrl || user?.profile_image_url}
          size={size}
          onPress={!imageUrl ? () => setOpen(true) : undefined}
        />
      </View>

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
              name={Platform.OS === "ios" ? "person-outline" : "person"}
              size={20}
              color={Colors.grey10}
            />
            <Text marginL-8>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={signOut}>
            <Ionicons
              name={Platform.OS === "ios" ? "log-out-outline" : "log-out"}
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
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 42,
    right: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
