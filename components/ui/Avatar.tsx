import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AvatarProps {
  imageUrl?: string | null;
  size?: number;
  onPress?: () => void;
  showCamera?: boolean;
  loading?: boolean;
  disabled?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  size = 32,
  onPress,
  showCamera = false,
  loading = false,
  disabled = false,
  borderColor = Colors.white,
  borderWidth = 0,
}) => {
  const avatarSize = size;
  const iconSize = Math.max(size * 0.8, 24);
  const cameraSize = Math.max(size * 0.25, 20);
  const cameraIconSize = Math.max(size * 0.15, 12);

  const containerStyle = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
  ];

  const imageStyle = [
    styles.image,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      borderWidth,
      borderColor,
    },
  ];

  const cameraIconStyle = [
    styles.cameraIcon,
    {
      width: cameraSize,
      height: cameraSize,
      borderRadius: cameraSize / 2,
      bottom: -2,
      right: -2,
    },
  ];

  const loadingOverlayStyle = [
    styles.loadingOverlay,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
  ];

  const content = (
    <View style={containerStyle}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={imageStyle} />
      ) : (
        <Ionicons
          name="person-circle"
          size={iconSize}
          color={Colors.grey40}
        />
      )}
      
      {loading && (
        <View style={loadingOverlayStyle}>
          <ActivityIndicator size="small" color={Colors.white} />
        </View>
      )}
      
      {showCamera && !loading && (
        <View style={cameraIconStyle}>
          <Ionicons name="camera" size={cameraIconSize} color={Colors.white} />
        </View>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    backgroundColor: Colors.blue30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
