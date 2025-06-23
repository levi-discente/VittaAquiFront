import React from 'react';
import { View, Text, Card, Colors } from 'react-native-ui-lib';
import { ProfessionalProfile } from '../types/professional';

interface Props {
  professional: ProfessionalProfile;
  onPress: () => void;
}

const ProfessionalCard = ({ professional, onPress }: Props) => {
  return (
    <Card
      onPress={onPress}
      borderRadius={4}
      marginB-16
      style={{ elevation: 2 }}
      padding-16
    >
      <Text text60 marginB-4>{professional.category}</Text>
      <Text text70 marginB-4 numberOfLines={2}>
        {professional.bio}
      </Text>
      <Text text80 grey30>Preço: R$ {professional.price.toFixed(2)}</Text>
      <Text text80 grey30>Atendimento: {professional.mode}</Text>
    </Card>
  );
};

export default ProfessionalCard;
