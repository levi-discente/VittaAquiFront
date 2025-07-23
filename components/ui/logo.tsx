import { Image } from "react-native";


export const LogoTitle = () => (
  <Image
    source={require('@/assets/images/logo.png')}
    style={{ width: 32, height: 32, marginLeft: 8 }}
    resizeMode="contain"
  />
);
