// app/explore.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExploreScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Screen</Text>
      <Text>Here you can explore various features of the app.</Text>
      {/* Additional content can be added here */}
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
});

export default ExploreScreen;
