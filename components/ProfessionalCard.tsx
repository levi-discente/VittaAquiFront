import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Card, Colors } from 'react-native-ui-lib';
import { ProfessionalProfile } from '../types/professional';

const CATEGORY_LABELS: Record<string, string> = {
  doctor: 'Médico',
  nutritionist: 'Nutricionista',
  psychologist: 'Psicólogo',
  physician: 'Psiquiatra',
  personal_trainer: 'Personal Trainer',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

interface ProfessionalCardProps {
  profile: ProfessionalProfile;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ profile }) => {
  const {
    userName,
    category,
    bio,
    services,
    price,
    tags,
    online,
    presencial
  } = profile;

  return (
    <Card style={[styles.card, { width: CARD_WIDTH }]}>
      {/* Badge no canto superior */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {CATEGORY_LABELS[category] ?? category}
        </Text>
      </View>

      {/* Título */}
      <Text style={styles.name}>{userName}</Text>

      {/* Bio */}
      {bio ? <Text style={styles.bio}>{bio}</Text> : null}

      {/* Serviços */}
      {services && services.length > 0 && (
        <Text style={styles.services}>
          Serviços: {services.join(', ')}
        </Text>
      )}

      {/* Preço */}
      {price != null && (
        <Text style={styles.price}>Preço: R$ {price.toFixed(2)}</Text>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Indicadores online/presencial */}
      <View style={styles.flags}>
        {online != null && (
          <Text style={[styles.flag, online ? styles.online : styles.offline]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        )}
        {presencial != null && (
          <Text style={[styles.flag, presencial ? styles.presential : styles.offline]}>
            {presencial ? 'Presencial' : 'Não Presencial'}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.blue30,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: Colors.grey40,
    marginBottom: 8,
  },
  services: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: Colors.grey70,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.blue5,
  },
  flags: {
    flexDirection: 'row',
    marginTop: 8,
  },
  flag: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  online: { color: Colors.green30 },
  presential: { color: Colors.blue30 },
  offline: { color: Colors.red30 },
});

