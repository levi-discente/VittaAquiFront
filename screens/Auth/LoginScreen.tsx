import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Text as RNText,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { useAuth } from "@/hooks/useAuth";
import { Snackbar } from "@/components/Snackbar";
import { View, Checkbox, Text } from "react-native-ui-lib";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const REMEMBER_KEY = "@app:rememberedEmail";

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const { width } = Dimensions.get("window");
  const CARD_WIDTH = Math.min(width * 0.9, 400);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_KEY).then((stored) => {
      if (stored) {
        setEmail(stored);
        setRemember(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      if (remember) {
        await AsyncStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY);
      }
    } catch (err: any) {
      Snackbar.show({
        text: err.response?.data?.message || "Erro ao autenticar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { width: CARD_WIDTH }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Entrar</Text>

            <TextInput
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={[styles.inputWrapper, { marginBottom: 12 }]}>
              <TextInput
                placeholder="Senha"
                style={[styles.input, { paddingRight: 40 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <View row centerV marginB-12>
              <Checkbox
                label="Lembrar e-mail"
                value={remember}
                onValueChange={setRemember}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!email || !password || loading) && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!email || !password || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <RNText style={styles.buttonText}>Entrar</RNText>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <RNText style={styles.link}>
                Ainda não tem conta? Cadastre-se
              </RNText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  link: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 15,
  },
  flex: { flex: 1 },
  eyeButton: {
    position: "absolute",
    right: 10,
    top: Platform.OS === "ios" ? 14 : 12,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
});

export default LoginScreen;
