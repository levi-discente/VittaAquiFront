import { Platform } from 'react-native';
import { Toast, Colors } from 'react-native-ui-lib';
import { toast } from 'react-toastify';

export const notifySuccess = (message: string) => {
  if (Platform.OS === 'web') {
    toast.success(message);
  } else {
    Toast.show({
      message,
      backgroundColor: Colors.green30,
      autoDismiss: true,
      duration: 3000
    });
  }
};

export const notifyError = (message: string) => {
  if (Platform.OS === 'web') {
    toast.error(message);
  } else {
    Toast.show({
      message,
      backgroundColor: Colors.red30,
      autoDismiss: true,
      duration: 3000
    });
  }
};

