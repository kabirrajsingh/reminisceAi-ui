import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CameraComponent from './components/CameraComponent';
import { useRouter } from 'expo-router'; // Import the navigation hook
import { Ionicons } from '@expo/vector-icons'; // Icon library for better visuals

const PictureScreen: React.FC = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to control camera visibility
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility

  const handleImageUpload = async () => {
    // Request permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access the camera roll is required!");
      return;
    }

    // Launch the image picker
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      // Set the selected image URI
      const photoUri = pickerResult.assets[0].uri;
      setSelectedImage(photoUri);

      // Navigate to the PhotoPreviewScreen
      router.push({
        pathname: '/PhotoPreviewScreen',
        params: { photoUri: photoUri },
      });
    } else {
      alert('You did not select any image.');
    }
  };

  const openImageModal = () => {
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
  };

  const openCamera = () => {
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your App!</Text>
      <Text style={styles.description}>
        This app allows you to capture photos using your device's camera and upload them seamlessly.
      </Text>
      <Text style={styles.featuresTitle}>Features:</Text>
      <Text style={styles.features}>
        - Capture high-quality images{'\n'}
        - Upload images with ease{'\n'}
        - User-friendly interface
      </Text>

      {/* Upload Image Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
        <Ionicons name="image" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload Image from Device</Text>
      </TouchableOpacity>

      {/* Display the selected image if available */}
      {/* {selectedImage && (
        <TouchableOpacity onPress={openImageModal}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
          />
        </TouchableOpacity>
      )} */}

      {/* Button to open the camera in full screen */}
      <TouchableOpacity style={styles.openCameraButton} onPress={openCamera}>
        <Text style={styles.openCameraButtonText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Show CameraComponent in full screen */}
      <Modal
        visible={isCameraOpen}
        transparent={false}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <CameraComponent onClose={closeCamera} />
        </View>
      </Modal>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff', // Changed to white for clarity
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333', // Dark text for better readability
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555', // Slightly lighter for contrast
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#6200ee', // Primary color for headings
  },
  features: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444', // Improved contrast
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee', // Primary color for the button
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  openCameraButton: {
    backgroundColor: '#6200ee', // Primary color for the open camera button
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  openCameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 20,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Elevation for Android shadow
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Black background for better visibility
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Adjusts the image to fit within the modal
  },
});

export default PictureScreen;
