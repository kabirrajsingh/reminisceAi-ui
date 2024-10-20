import React from 'react';
import { Image, StyleSheet, View, Button, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // You can use any icon library

export default function PhotoPreview() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams(); // Get photoUri from parameters

  // Sample image URL to use if photoUri is undefined
  const defaultImageUri = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMHN8i-hZl6MjI2tuMsN_cwz2c6dZMbZg_og&s'; // Change this to your preferred default image URL
  const imageUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Preview</Text>
      </View>

      <Image 
        source={{ uri: imageUri || defaultImageUri }} // Use default image if photoUri is undefined
        style={styles.image} 
      />

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back to Camera</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background for contrast
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#6200ee', // Primary color for the back button
    borderRadius: 50,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Dark text for contrast
  },
  image: {
    width: '100%',
    height: '70%', // Adjust height for better layout
    borderRadius: 10, // Rounded corners for image
    marginTop: 20,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5, // Elevation for Android shadow
  },
  button: {
    backgroundColor: '#6200ee', // Primary color for the button
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff', // White text for contrast
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
