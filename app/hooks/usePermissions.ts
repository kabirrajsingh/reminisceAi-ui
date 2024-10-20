import { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export const usePermissions = () => {
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      // Request camera permission using the correct method
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      // Request microphone permission using Audio module
      const audioStatus = await Audio.requestPermissionsAsync();
      setAudioPermission(audioStatus.status === 'granted');
    })();
  }, []);

  return { cameraPermission, audioPermission };
};
