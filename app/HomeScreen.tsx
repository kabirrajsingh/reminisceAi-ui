// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const IndexScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App!</Text>
      <Text style={styles.description}>This app allows you to capture and upload images.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default IndexScreen;
