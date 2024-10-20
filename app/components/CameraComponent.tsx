import { Camera, CameraType } from 'expo-camera/legacy';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router'; // Import the navigation hook

interface CameraComponentProps {
  onClose: () => void; // Define onClose prop
}

export default function CameraComponent({ onClose }: CameraComponentProps) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef<Camera | null>(null); // Create a ref for the Camera component
  const router = useRouter(); // Initialize the navigation hook

  // Show a loading screen while permissions are being resolved
  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  // Ask for camera permissions if not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const handleCapturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync(); // Capture the photo
      router.push({
        pathname: '/PhotoPreviewScreen',
        params: { photoUri: photo.uri },
      });
      onClose(); // Call onClose after capturing the photo
    }
  };

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.text}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
            <Text style={styles.captureText}>Capture Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Dark background for loading
  },
  container: {
    flex: 1,
    backgroundColor: '#000', // Fullscreen black background for camera
  },
  camera: {
    flex: 1, // Full height and width
    aspectRatio: 1, // Maintain aspect ratio
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end', // Align buttons to the bottom
    padding: 20,
  },
  flipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for visibility
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  captureButton: {
    alignSelf: 'center',
    backgroundColor: '#6200ee', // Primary color for the capture button
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
    elevation: 5, // Elevation for shadow effect
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', // Semi-transparent red for close button
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  captureText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  permissionText: {
    color: 'red', // Red color for permission alert
    textAlign: 'center',
    marginBottom: 20,
  },
});
