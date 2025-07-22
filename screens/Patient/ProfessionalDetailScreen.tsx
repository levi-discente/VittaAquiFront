import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import { Text, Colors } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/ProfileStack';
import { useProfessionalProfile } from '@/hooks/useProfessionals';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfessionalDetail'>;

const { width } = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = Math.min(width - PADDING * 2, 500);

const ProfessionalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { profileId } = route.params;
  const { profile, loading, error, refresh } = useProfessionalProfile(profileId);

  // set title and share button in header
  useEffect(() => {
    if (profile) {
      navigation.setOptions({
        title: '',
        headerRight: () => (
          <TouchableOpacity onPress={onShare} style={styles.headerShare}>
            <Ionicons name="share-social-outline" size={24} color={Colors.blue30} />
          </TouchableOpacity>
        )
      });
    }
  }, [profile]);

  const onShare = async () => {
    if (!profile) return;
    await Share.share({
      message: `Confira o profissional ${profile.userName} (${profile.category}) no nosso app!`
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text text70 red30>{error ?? 'Perfil não encontrado'}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        {/* HEADER */}
        <View style={styles.header}>
          {profile.imageUrl ? (
            <Image source={{ uri: profile.imageUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={80} color={Colors.grey40} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{profile.userName}</Text>
            <Text style={styles.location}>{profile.uf} • {profile.city}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={Colors.yellow30} />
              <Text style={styles.ratingText}>
                {profile.rating.toFixed(1)} ({profile.numReviews})
              </Text>
            </View>
          </View>
        </View>

        {/* KEY DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <Text style={styles.detailItem}><Ionicons name="mail-outline" /> {profile.email}</Text>
          {profile.phone ? (
            <Text style={styles.detailItem}><Ionicons name="call-outline" /> {profile.phone}</Text>
          ) : null}
        </View>

        {/* BIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.sectionContent}>{profile.bio}</Text>
        </View>

        {/* REVIEWS (placeholder scrollable) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
          >
            {/* futuramente mapear avaliações reais */}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>“Ótimo profissional, muito dedicado.”</Text>
              <Text style={styles.reviewAuthor}>— João</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>“Excelente atendimento!”</Text>
              <Text style={styles.reviewAuthor}>— Maria</Text>
            </View>
          </ScrollView>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {/* TODO: navegar para chat */ }}
          >
            <Ionicons name="chatbubble-outline" size={24} color={Colors.blue30} />
            <Text style={styles.actionLabel}>Conversar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Booking', { profileId })}
          >
            <Ionicons name="calendar-outline" size={24} color={Colors.blue30} />
            <Text style={styles.actionLabel}>Agendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { alignItems: 'center', paddingVertical: 24 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    padding: PADDING,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: Colors.greyLight,
  },
  headerInfo: { flex: 1 },
  name: { fontSize: 24, fontWeight: '700' },
  location: { fontSize: 14, color: Colors.grey40, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 4, fontSize: 14 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  detailItem: { fontSize: 14, marginBottom: 4 },
  sectionContent: { fontSize: 14, color: Colors.grey10, lineHeight: 20 },

  reviewsScroll: { paddingVertical: 8 },
  reviewCard: {
    backgroundColor: Colors.grey90,
    borderRadius: 6,
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  reviewText: { fontSize: 14, marginBottom: 8 },
  reviewAuthor: { fontSize: 12, color: Colors.grey40 },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.blue30,
  },
  headerShare: {
    marginRight: 12,
  },
});

export default ProfessionalDetailScreen;

