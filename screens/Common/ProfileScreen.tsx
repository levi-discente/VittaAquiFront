import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, Button, Colors, Card, TextField } from "react-native-ui-lib";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Avatar } from "@/components/ui/Avatar";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Snackbar } from "@/components/Snackbar";
import { AppSelect, Option } from "@/components/ui/AppSelect";
import { uploadProfileImage } from "@/api/user";
import {
  maskCPF,
  maskCEP,
  maskPhone,
  validateCPF,
  fetchAddressByCep,
} from "@/utils/forms";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfessionalStackParamList } from "@/navigation/ProfessionalStack";

const STATES: Option[] = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((s) => ({ label: s, value: s }));

type NavigationProp = NativeStackNavigationProp<
  ProfessionalStackParamList,
  "Home"
>;
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Nome obrigatório"),
  email: Yup.string().email("Email inválido").required("Email obrigatório"),
  cpf: Yup.string()
    .required("CPF obrigatório")
    .test("valid-cpf", "CPF inválido", (v) => (v ? validateCPF(v) : false)),
  phone: Yup.string(),
  cep: Yup.string().required("CEP obrigatório"),
  uf: Yup.string().required("UF obrigatória"),
  city: Yup.string().required("Cidade obrigatória"),
  address: Yup.string().required("Endereço obrigatório"),
});

const ProfileScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { user, loading, updateUser, refresh } = useUser();
  const [editing, setEditing] = useState(false);
  const [snack, setSnack] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [addrLoading, setAddrLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const isWide = width >= 600;

  useEffect(() => {
    if (!loading && !user) {
      setSnack({
        visible: true,
        message: "Não foi possível carregar o perfil",
        type: "error",
      });
    }
  }, [loading, user]);

  if (loading && !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue30} />
      </View>
    );
  }
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text text70 red30>
          Perfil não disponível
        </Text>
      </View>
    );
  }

  // Aplica máscara nos valores iniciais para exibição e edição
  const initialValues = {
    name: user.name,
    email: user.email,
    cpf: user.cpf ? maskCPF(user.cpf) : "",
    phone: user.phone ? maskPhone(user.phone) : "",
    cep: user.cep ? maskCEP(user.cep) : "",
    uf: user.uf || "",
    city: user.city || "",
    address: user.address || "",
  };

  // Campos estáticos para o Card, com máscara e multiline no endereço
  const displayFields = [
    { label: "CPF", value: user.cpf ? maskCPF(user.cpf) : "" },
    { label: "Telefone", value: user.phone ? maskPhone(user.phone) : "" },
    { label: "CEP", value: user.cep ? maskCEP(user.cep) : "" },
    { label: "UF", value: user.uf || "" },
    { label: "Cidade", value: user.city || "" },
    { label: "Endereço", value: user.address || "" },
  ];

  const showSnack = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setSnack({ visible: true, message, type });
  };

  const handleCepChange = async (text: string, setFieldValue: any) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    setFieldValue("cep", maskCEP(text));
    if (cleaned.length === 8) {
      setAddrLoading(true);
      try {
        const { uf, city, address } = await fetchAddressByCep(cleaned);
        setFieldValue("uf", uf);
        setFieldValue("city", city);
        setFieldValue("address", address);
      } catch (err: any) {
        showSnack(err.message, "error");
      } finally {
        setAddrLoading(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showSnack("Permissão para acessar galeria negada", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        try {
          await uploadProfileImage(result.assets[0].uri);
          await refresh();
          showSnack("Foto de perfil atualizada!", "success");
        } catch (err: any) {
          showSnack(err.message || "Erro ao fazer upload da imagem", "error");
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (err: any) {
      showSnack("Erro ao selecionar imagem", "error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={[styles.header, isWide && styles.headerWide]}>
            <View style={styles.avatarContainer}>
              <Avatar
                imageUrl={user.profile_image_url}
                size={isWide ? 140 : 120}
                onPress={pickImage}
                showCamera={true}
                loading={uploadingImage}
                disabled={uploadingImage}
                borderColor={Colors.white}
                borderWidth={4}
              />
            </View>
            <View
              style={[
                styles.headerText,
                isWide && { alignItems: "flex-start" },
              ]}
            >
              <Text text40 white>
                {user.name}
              </Text>
              <Text text80 white>
                {user.email}
              </Text>
              {user.role && (
                <View style={styles.roleBadge}>
                  <Text text90 style={styles.roleText}>
                    {user.role === 'professional' ? 'Profissional' : 'Cliente'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {!editing ? (
            <View style={styles.content}>
              <Card style={styles.card}>
                {displayFields.map(({ label, value }) =>
                  value ? (
                    <View
                      key={label}
                      style={
                        label === "Endereço" ? styles.addressRow : styles.row
                      }
                    >
                      <Text text90 grey40>
                        {label}:
                      </Text>
                      <Text
                        text70
                        style={
                          label === "Endereço" ? styles.addressText : undefined
                        }
                      >
                        {value}
                      </Text>
                    </View>
                  ) : null
                )}
              </Card>
              <View style={[styles.actions, isWide && styles.actionsWide]}>
                <Button
                  outline
                  label="Editar Perfil"
                  outlineColor={Colors.blue30}
                  labelStyle={{ color: Colors.blue30 }}
                  style={styles.actionBtn}
                  onPress={() => setEditing(true)}
                />
                <Button
                  outline
                  label="Sair"
                  outlineColor={Colors.red30}
                  labelStyle={{ color: Colors.red30 }}
                  style={styles.actionBtn}
                  onPress={signOut}
                />
              </View>
            </View>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={ProfileSchema}
              onSubmit={async (vals, { setSubmitting }) => {
                try {
                  // Remove máscara antes de enviar
                  await updateUser({
                    ...vals,
                    cpf: vals.cpf.replace(/\D/g, ""),
                    phone: vals.phone.replace(/\D/g, ""),
                    cep: vals.cep.replace(/\D/g, ""),
                  });
                  showSnack("Perfil atualizado!", "success");
                  setEditing(false);
                } catch (err: any) {
                  showSnack(err.message, "error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                handleChange,
                setFieldValue,
                handleSubmit,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={styles.content}>
                  <View
                    style={[styles.rowInputs, isWide && styles.rowInputsWide]}
                  >
                    {[
                      {
                        key: "name",
                        label: "Nome",
                        keyboard: "default",
                        mask: null,
                      },
                      {
                        key: "email",
                        label: "Email",
                        keyboard: "email-address",
                        mask: null,
                      },
                      {
                        key: "cpf",
                        label: "CPF",
                        keyboard: "numeric",
                        mask: maskCPF,
                      },
                      {
                        key: "phone",
                        label: "Telefone",
                        keyboard: "phone-pad",
                        mask: maskPhone,
                      },
                    ].map(({ key, label, keyboard, mask }) => (
                      <View
                        key={key}
                        style={[
                          styles.inputWrapper,
                          isWide && styles.inputWrapperWide,
                        ]}
                      >
                        <TextField
                          floatingPlaceholder
                          placeholder={label}
                          value={(values as any)[key]}
                          keyboardType={keyboard as any}
                          fieldStyle={styles.inputField}
                          onChangeText={(text) =>
                            mask
                              ? setFieldValue(key, mask(text))
                              : handleChange(key)(text)
                          }
                          error={
                            touched[key] && errors[key]
                              ? (errors as any)[key]
                              : undefined
                          }
                        />
                      </View>
                    ))}

                    <View
                      style={[
                        styles.inputWrapper,
                        isWide && styles.inputWrapperWide,
                      ]}
                    >
                      <TextField
                        floatingPlaceholder
                        placeholder="CEP"
                        value={values.cep}
                        keyboardType="numeric"
                        fieldStyle={styles.inputField}
                        onChangeText={(t) => handleCepChange(t, setFieldValue)}
                        trailingAccessory={addrLoading && <ActivityIndicator />}
                        error={
                          touched.cep && errors.cep ? errors.cep : undefined
                        }
                      />
                    </View>

                    <View
                      style={[
                        styles.inputWrapper,
                        isWide && styles.inputWrapperWide,
                      ]}
                    >
                      <AppSelect
                        options={STATES}
                        selectedValue={values.uf}
                        onValueChange={(val) => setFieldValue("uf", val)}
                        placeholder="UF"
                        containerStyle={styles.inputField}
                      />
                      {touched.uf && errors.uf && (
                        <Text text90 red30>
                          {errors.uf}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.inputWrapper,
                        isWide && styles.inputWrapperWide,
                      ]}
                    >
                      <TextField
                        floatingPlaceholder
                        placeholder="Cidade"
                        value={values.city}
                        fieldStyle={styles.inputField}
                        onChangeText={handleChange("city")}
                        error={
                          touched.city && errors.city ? errors.city : undefined
                        }
                      />
                    </View>

                    <View
                      style={[
                        styles.inputWrapper,
                        isWide && styles.inputWrapperWide,
                      ]}
                    >
                      <TextField
                        floatingPlaceholder
                        placeholder="Endereço"
                        value={values.address}
                        multiline
                        numberOfLines={4}
                        fieldStyle={[styles.inputField, styles.multilineField]}
                        onChangeText={handleChange("address")}
                        error={
                          touched.address && errors.address
                            ? errors.address
                            : undefined
                        }
                      />
                    </View>
                  </View>

                  <View style={[styles.actions, isWide && styles.actionsWide]}>
                    <Button
                      outline
                      label="Cancelar"
                      outlineColor={Colors.grey40}
                      labelStyle={{ color: Colors.grey40 }}
                      style={styles.actionBtn}
                      disabled={isSubmitting}
                      onPress={() => setEditing(false)}
                    />
                    <Button
                      label={isSubmitting ? "Salvando..." : "Salvar"}
                      disabled={isSubmitting}
                      style={styles.actionBtn}
                      onPress={handleSubmit as any}
                    />
                  </View>
                </View>
              )}
            </Formik>
          )}
        </ScrollView>

        <Snackbar
          visible={snack.visible}
          message={snack.message}
          type={snack.type}
          onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerWide: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  avatarContainer: {
    marginBottom: 16,
    position: "relative",
  },
  headerText: {
    alignItems: "center",
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey70,
  },
  addressRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey70,
  },
  addressText: {
    marginTop: 4,
    flexWrap: "wrap",
  },
  actions: {
    flexDirection: "column",
  },
  actionsWide: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionBtn: {
    marginVertical: 6,
    marginLeft: 8,
  },
  rowInputs: {
    flexDirection: "column",
  },
  rowInputsWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 20,
  },
  inputWrapperWide: {
    width: "48%",
  },
  inputField: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.grey40,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  multilineField: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});

export default ProfileScreen;
