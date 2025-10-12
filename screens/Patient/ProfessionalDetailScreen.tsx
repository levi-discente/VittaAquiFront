import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Text, Colors, Card, Button } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/ProfileStack';
import { useProfessionalProfile } from '@/hooks/useProfessionals';
import { maskPhone } from '@/utils/forms';
import MapComponent from '@/components/MapComponent';
import { AppointmentModal } from '@/components/AppointmentModal';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfessionalDetail'>;

const { width } = Dimensions.get('window');
const PADDING = 16;
const CONTENT_WIDTH = Math.min(width - PADDING * 2, 500);

const ProfessionalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profileId } = route.params;
  const { profile, loading, error, refresh } = useProfessionalProfile(profileId);

  const [bookingVisible, setBookingVisible] = useState(false);

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


  useEffect(() => {
    if (profile) {
      navigation.setOptions({
        title: profile.userName,
        headerLargeTitle: false,
        headerTitleAlign: 'center',
        headerRight: () => (
          <TouchableOpacity onPress={onShare} style={styles.headerShare}>
            <Ionicons name="share-social" size={24} color={Colors.blue30} />
          </TouchableOpacity>
        ),
      });
    }
  }, [profile]);


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
        <Text text70 red30>{error ?? 'Perfil não encontrado'}</Text>
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
            <Text text90 grey40>Preço</Text>
            <Text text70>R$ {profile.price.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text text90 grey40>Disponibilidade</Text>
            <View style={styles.availRow}>
              {profile.onlyOnline && (
                <View style={styles.availTag}>
                  <Ionicons name="globe-outline" size={14} />
                  <Text text90 style={styles.availText}>Online</Text>
                </View>
              )}
              {profile.onlyPresential && (
                <View style={styles.availTag}>
                  <Ionicons name="home" size={14} />
                  <Text text90 style={styles.availText}>Presencial</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* CONTACT */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>Contato</Text>
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
          <Text text100M style={styles.sectionTitle}>Localização</Text>
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
              style={{ borderRadius: 8, overflow: 'hidden' }}
            />
          </View>
        </Card>

        {/* SERVICES */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>Serviços</Text>
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
          <Text text100M style={styles.sectionTitle}>Tags</Text>
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
          <Text text100M style={styles.sectionTitle}>Sobre</Text>
          <Text text90 style={styles.sectionContent}>
            {profile.bio}
          </Text>
        </Card>

        {/* REVIEWS */}
        <Card style={[styles.sectionCard, { width: CONTENT_WIDTH }]}>
          <Text text100M style={styles.sectionTitle}>Avaliações</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
          >
            <View style={styles.reviewCard}>
              <Text text90>“Ótimo profissional, muito dedicado.”</Text>
              <Text text90 grey40>— João</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text text90>“Excelente atendimento!”</Text>
              <Text text90 grey40>— Maria</Text>
            </View>
          </ScrollView>
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
            navigation.navigate('Appointments');
          }}
          professionalId={Number(profileId)}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.blue30,
    padding: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 16,
  },
  headerShare: { marginRight: 12 },

  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.grey70,
    marginBottom: 12,
  },
  heroInfo: { alignItems: 'center' },
  heroSub: { marginTop: 4, textTransform: 'capitalize' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: { marginLeft: 4 },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: PADDING,
    marginBottom: 16,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  sectionTitle: { marginBottom: 8 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  availRow: {
    flexDirection: 'row',
  },
  availTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.grey70,
    borderRadius: 12,
    marginLeft: 8,
  },
  availText: { marginLeft: 4, fontSize: 12 },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  touchableText: {
    paddingHorizontal: 4,
  },
  detailText: { marginLeft: 8 },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    padding: 12,
  },
});

export default ProfessionalDetailScreen;
