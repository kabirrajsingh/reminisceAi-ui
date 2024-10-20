import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import Slider from '@react-native-community/slider';

const AudioScreen = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Request permission to access microphone
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable audio recording permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  // Function to start recording
  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    console.log('Stopping recording..');
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
    console.log('Recording stopped and stored at', uri);
  };

  // Function to play the recorded audio
  const playSound = async () => {
    if (audioUri) {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          console.log('Sound not loaded');
          return;
        }
        
        setPosition(status.positionMillis ?? 0);
        setDuration(status.durationMillis ?? 0);

        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          setPosition(0);
        }
      });
      
    } else {
      Alert.alert('No audio file', 'Please record or upload an audio file first.');
    }
  };

  // Function to pause playback
  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Function to resume playback
  const resumeSound = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // Function to stop playback
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      await sound.unloadAsync();
      setPosition(0);
    }
  };

  // Function to handle file upload
  const uploadAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (true) {
    //   setAudioUri(result.uri);
      console.log('Uploaded audio file URI:', result);
    } else {
      Alert.alert('File Upload Failed', 'Failed to upload audio file');
    }
  };

  // Function to seek to a specific position in the audio
  const seekToPosition = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Recorder</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={playSound} disabled={!audioUri || isPlaying}>
          <Text style={styles.buttonText}>Play Recording</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pauseSound} disabled={!isPlaying}>
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resumeSound} disabled={!sound || isPlaying}>
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopSound} disabled={!isPlaying}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={uploadAudioFile}>
          <Text style={styles.buttonText}>Upload Audio File</Text>
        </TouchableOpacity>
      </View>

      {/* Audio Playback Slider */}
      {audioUri && (
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={seekToPosition}
            minimumTrackTintColor="#FF4081"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#FF4081"
        
          />
          <Text style={styles.positionText}>
            {`${Math.floor(position / 1000)}s / ${Math.floor(duration / 1000)}s`}
          </Text>
        </View>
      )}

      {audioUri && <Text style={styles.uriText}>Recorded Audio URI: {audioUri}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E2F', // Dark background color
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    color: '#FFD700', // Gold color for title
    marginBottom: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF4081', // Pink color for buttons
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
    width: '85%',
    alignItems: 'center',
    elevation: 5, // Add shadow
  },
  recordingButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  positionText: {
    color: '#FFD700', // Gold color for position text
    marginTop: 5,
    fontSize: 16,
  },
  uriText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AudioScreen;
