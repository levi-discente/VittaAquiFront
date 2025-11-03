import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Text, Colors, Card, Button } from "react-native-ui-lib";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/navigation/ProfileStack";
import { useProfessionalProfile } from "@/hooks/useProfessionals";
import { maskPhone } from "@/utils/forms";
import MapComponent from "@/components/MapComponent";
import { AppointmentModal } from "@/components/AppointmentModal";
import {
  getProfessionalReviews,
  createReview,
  countPatientReviewsForProfessional,
  Review,
  ReviewList,
} from "@/api/review";
import { useAuth } from "@/hooks/useAuth";
import { getMyAppointments } from "@/api/appointment";
import { Appointment } from "@/types/appointment";

type Props = NativeStackScreenProps<
  ProfileStackParamList,
  "ProfessionalDetail"
>;

const { width } = Dimensions.get("window");
const PADDING = 16;
const CONTENT_WIDTH = Math.min(width - PADDING * 2, 500);

const ProfessionalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profileId } = route.params;
  const { profile, loading, error, refresh } =
    useProfessionalProfile(profileId);
  const { user } = useAuth();

  const [bookingVisible, setBookingVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReviewCount, setUserReviewCount] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

  const servicesList: string[] = profile?.services
    ? Array.isArray(profile.services)
      ? profile.services
      : []
    : [];

  const onShare = async () => {
    if (!profile) return;
    await Share.share({
      message: `Confira o profissional ${profile.userName} (${profile.category}) no nosso app!`,
    });
  };
  const dialPhone = (phone: string) => Linking.openURL(`tel:${phone}`);
  const sendEmail = (email: string) => Linking.openURL(`mailto:${email}`);
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };
  const openMap = () => {
    if (!profile) return;
    const query = `${profile.address}, ${profile.city}, ${profile.uf}, CEP ${profile.cep}`;
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodeURIComponent(query)}`,
      android: `geo:0,0?q=${encodeURIComponent(query)}`,
    })!;
    Linking.openURL(url);
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getProfessionalReviews(Number(profileId), 0, 20);
      setReviews(data.items);
      setTotalReviews(data.total);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check how many reviews the user has already made for this professional
  const checkUserReviewCount = async () => {
    try {
      const count = await countPatientReviewsForProfessional(Number(profileId));
      setUserReviewCount(count);
    } catch (err) {
      console.error("Error checking user review count:", err);
    }
  };

  // Fetch completed appointments with this professional
  const fetchCompletedAppointments = async () => {
    try {
      const appointments = await getMyAppointments();
      const completed = appointments.filter(
        (apt) =>
          apt.professional_id === Number(profileId) &&
          apt.status === "completed"
      );
      setCompletedAppointments(completed);
      if (completed.length > 0) {
        setSelectedAppointmentId(completed[0].id);
      }
    } catch (err) {
      console.error("Error fetching completed appointments:", err);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!newReviewComment.trim()) {
      Alert.alert("Erro", "Por favor, escreva um comentário.");
      return;
    }

    if (userReviewCount >= 1) {
      Alert.alert(
        "Limite atingido",
        "Você já fez 1 avaliação para este profissional."
      );
      return;
    }

    if (!selectedAppointmentId) {
      Alert.alert(
        "Erro",
        "Por favor, selecione uma consulta para avaliar."
      );
      return;
    }

    try {
      setSubmittingReview(true);
      await createReview({
        appointment_id: selectedAppointmentId,
        rating: newReviewRating,
        comment: newReviewComment,
        is_anonymous: false,
      });
      Alert.alert("Sucesso", "Avaliação enviada com sucesso!");
      setReviewModalVisible(false);
      setNewReviewComment("");
      setNewReviewRating(5);
      // Refresh reviews
      fetchReviews();
      checkUserReviewCount();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      Alert.alert(
        "Erro",
        err.response?.data?.detail || "Não foi possível enviar a avaliação."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (profile) {
      navigation.setOptions({
        title: profile.userName,
        headerLargeTitle: false,
        headerTitleAlign: "center",
        headerRight: () => (
          <TouchableOpacity onPress={onShare} style={styles.headerShare}>
            <Ionicons name="share-social" size={24} color={Colors.blue30} />
          </TouchableOpacity>
        ),
      });
      fetchReviews();
      if (user) {
        checkUserReviewCount();
        fetchCompletedAppointments();
      }
    }
  }, [profile, user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue30} />
      </View>
    );
  }
  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text text70 red30>
          {error ?? "Perfil não encontrado"}
        </Text>
        <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryLabel =
    profile.category.charAt(0).toUpperCase() + profile.category.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={[styles.hero, { width: CONTENT_WIDTH }]}>
          {profile.imageUrl ? (
            <Image source={{ uri: profile.imageUrl }} style={styles.avatar} />
          ) : (
            <Ionicons
              name="person-circle"
              size={100}
              color={Colors.$backgroundDark}
            />
          )}
          <View style={styles.heroInfo}>
            <Text text35m>{profile.userName}</Text>
            <Text text90 grey40 style={styles.heroSub}>
              {categoryLabel} • {profile.profissionalIdentification}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={Colors.yellow30} />
              <Text text90 style={styles.ratingText}>
                {profile.rating.toFixed(1)} ({profile.numReviews})
              </Text>
            </View>
          </View>
        </View>

        {/* PRICE & AVAILABILITY */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <View style={styles.row}>
            <Text text90 grey40>
              Preço
            </Text>
            <Text text70>R$ {profile.price.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text text90 grey40>
              Disponibilidade
            </Text>
            <View style={styles.availRow}>
              {profile.onlyOnline && (
                <View style={styles.availTag}>
                  <Ionicons name="globe-outline" size={14} />
                  <Text text90 style={styles.availText}>
                    Online
                  </Text>
                </View>
              )}
              {profile.onlyPresential && (
                <View style={styles.availTag}>
                  <Ionicons name="home" size={14} />
                  <Text text90 style={styles.availText}>
                    Presencial
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* CONTACT */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>
            Contato
          </Text>
          <View style={styles.detailRow}>
            <Ionicons name="mail" size={18} color={Colors.grey40} />
            <TouchableOpacity
              onPress={() => sendEmail(profile.email)}
              onLongPress={() => copyToClipboard(profile.email)}
              style={styles.touchableText}
            >
              <Text text90 style={styles.detailText}>
                {profile.email}
              </Text>
            </TouchableOpacity>
          </View>
          {profile.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={18} color={Colors.grey40} />
              <TouchableOpacity
                onPress={() => dialPhone(profile.phone)}
                onLongPress={() => copyToClipboard(profile.phone)}
                style={styles.touchableText}
              >
                <Text text90 style={styles.detailText}>
                  {maskPhone(profile.phone)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* LOCATION */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>
            Localização
          </Text>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={18} color={Colors.grey40} />
            <TouchableOpacity
              onPress={openMap}
              onLongPress={() => copyToClipboard(profile.cep)}
              style={styles.touchableText}
            >
              <Text text90 style={styles.detailText}>
                {profile.city} – {profile.uf} • CEP {profile.cep}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="home" size={18} color={Colors.grey40} />
            <TouchableOpacity
              onPress={openMap}
              onLongPress={() => copyToClipboard(profile.address)}
              style={styles.touchableText}
            >
              <Text text90 style={styles.detailText}>
                {profile.address}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <MapComponent
              cep={profile.cep}
              height={200}
              width={CONTENT_WIDTH - 32}
              style={{ borderRadius: 8, overflow: "hidden" }}
            />
          </View>
        </Card>

        {/* SERVICES */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>
            Serviços
          </Text>
          <View style={styles.chipContainer}>
            {servicesList.map((s) => (
              <View key={s} style={styles.chip}>
                <Text text90>{s.trim()}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* TAGS */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>
            Tags
          </Text>
          <View style={styles.chipContainer}>
            {(profile.tags ?? []).map((t) => (
              <View key={t} style={styles.tag}>
                <Text text90 white>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* BIO */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>
            Sobre
          </Text>
          <Text text90 style={styles.sectionContent}>
            {profile.bio}
          </Text>
        </Card>

        {/* REVIEWS */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <View style={styles.reviewHeader}>
            <Text text100M style={styles.sectionTitle}>
              Avaliações ({totalReviews})
            </Text>
            {user && userReviewCount < 1 && (
              <TouchableOpacity
                style={styles.addReviewBtn}
                onPress={() => setReviewModalVisible(true)}
              >
                <Ionicons name="add-circle" size={20} color={Colors.blue30} />
                <Text text90 style={styles.addReviewText}>
                  Avaliar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {reviewsLoading ? (
            <ActivityIndicator
              size="small"
              color={Colors.blue30}
              style={{ marginVertical: 16 }}
            />
          ) : reviews.length === 0 ? (
            <Text text90 grey40 style={{ marginVertical: 16 }}>
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScroll}
            >
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={14}
                        color={Colors.yellow30}
                      />
                    ))}
                  </View>
                  <Text text90 style={styles.reviewComment}>
                    "{review.comment || "Sem comentário"}"
                  </Text>
                  <Text text90 grey40>
                    —{" "}
                    {review.is_anonymous
                      ? "Anônimo"
                      : review.patient_name || "Paciente"}
                  </Text>
                  <Text text100 grey50 style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </Card>

        {/* ACTIONS */}
        <View style={[styles.actionsRow, { width: CONTENT_WIDTH }]}>
          <Button
            outline
            outlineColor={Colors.blue30}
            label=" Conversar"
            labelStyle={{ color: Colors.blue30 }}
            iconSource={() => (
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={Colors.blue30}
              />
            )}
            style={styles.actionBtn}
            onPress={() => {
              /* TODO: navegar para chat */
            }}
          />
          <Button
            label=" Agendar"
            iconSource={() => (
              <Ionicons name="calendar-outline" size={20} color="#fff" />
            )}
            style={[styles.actionBtn, styles.bookBtn]}
            onPress={() => setBookingVisible(true)}
          />
        </View>

        <AppointmentModal
          visible={bookingVisible}
          onClose={() => setBookingVisible(false)}
          onDone={() => {
            setBookingVisible(false);
            navigation.navigate("Appointments");
          }}
          professionalId={Number(profileId)}
        />
      </ScrollView>

      {/* REVIEW MODAL */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text text70>Avaliar Profissional</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.grey40} />
              </TouchableOpacity>
            </View>

            <Text text90 grey40 style={{ marginBottom: 12 }}>
              Você pode fazer até 1 avaliação. ({userReviewCount}/1)
            </Text>

            {completedAppointments.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Ionicons name="calendar-outline" size={48} color={Colors.grey50} />
                <Text text80 grey40 style={{ marginTop: 12, textAlign: "center" }}>
                  Você precisa ter uma consulta concluída com este profissional para avaliá-lo.
                </Text>
              </View>
            ) : (
              <>
                {/* Appointment Selector */}
                {completedAppointments.length > 1 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text text90 style={{ marginBottom: 8, fontWeight: "600" }}>
                      Selecione a consulta:
                    </Text>
                    <View style={styles.appointmentSelector}>
                      {completedAppointments.map((apt) => (
                        <TouchableOpacity
                          key={apt.id}
                          style={[
                            styles.appointmentOption,
                            selectedAppointmentId === apt.id && styles.appointmentOptionSelected,
                          ]}
                          onPress={() => setSelectedAppointmentId(apt.id)}
                        >
                          <Ionicons
                            name={selectedAppointmentId === apt.id ? "radio-button-on" : "radio-button-off"}
                            size={20}
                            color={selectedAppointmentId === apt.id ? Colors.blue30 : Colors.grey50}
                          />
                          <Text text90 style={{ marginLeft: 8 }}>
                            {new Date(apt.start_time).toLocaleDateString("pt-BR")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

            {/* Star Rating */}
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewReviewRating(star)}
                >
                  <Ionicons
                    name={star <= newReviewRating ? "star" : "star-outline"}
                    size={32}
                    color={Colors.yellow30}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Escreva seu comentário..."
              placeholderTextColor={Colors.grey50}
              multiline
              numberOfLines={4}
              value={newReviewComment}
              onChangeText={setNewReviewComment}
              maxLength={2000}
            />

            <Text
              text100
              grey50
              style={{ alignSelf: "flex-end", marginTop: 4 }}
            >
              {newReviewComment.length}/2000
            </Text>

            {/* Submit Button */}
            <Button
              label={submittingReview ? "Enviando..." : "Enviar Avaliação"}
              disabled={submittingReview || !newReviewComment.trim() || completedAppointments.length === 0}
              onPress={handleSubmitReview}
              style={styles.submitReviewBtn}
            />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  retryBtn: {
    flexDirection: "row",
    backgroundColor: Colors.blue30,
    padding: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  retryText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 16,
  },
  headerShare: { marginRight: 12 },

  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.grey70,
    marginBottom: 12,
  },
  heroInfo: { alignItems: "center" },
  heroSub: { marginTop: 4, textTransform: "capitalize" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingText: { marginLeft: 4 },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: PADDING,
    marginBottom: 16,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  sectionTitle: { marginBottom: 8 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  availRow: {
    flexDirection: "row",
  },
  availTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.grey70,
    borderRadius: 12,
    marginLeft: 8,
  },
  availText: { marginLeft: 4, fontSize: 12 },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  touchableText: {
    paddingHorizontal: 4,
  },
  detailText: { marginLeft: 8 },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: Colors.grey90,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: Colors.blue30,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },

  sectionContent: {
    color: Colors.grey40,
    lineHeight: 20,
  },

  reviewsScroll: {
    paddingVertical: 8,
  },
  reviewCard: {
    backgroundColor: Colors.grey90,
    borderRadius: 6,
    padding: 12,
    marginRight: 12,
    width: 220,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookBtn: {
    backgroundColor: Colors.blue30,
  },
  mapContainer: {
    marginTop: 12,
    alignItems: "center",
    padding: 12,
  },

  // Review styles
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.grey90,
    borderRadius: 16,
  },
  addReviewText: {
    marginLeft: 4,
    color: Colors.blue30,
    fontWeight: "600",
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewComment: {
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    marginTop: 4,
    fontSize: 11,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.grey60,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    marginTop: 16,
  },
  submitReviewBtn: {
    marginTop: 16,
    backgroundColor: Colors.blue30,
    borderRadius: 8,
    paddingVertical: 14,
  },
  appointmentSelector: {
    gap: 8,
  },
  appointmentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.grey60,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  appointmentOptionSelected: {
    borderColor: Colors.blue30,
    backgroundColor: "#eff6ff",
  },
});

export default ProfessionalDetailScreen;
