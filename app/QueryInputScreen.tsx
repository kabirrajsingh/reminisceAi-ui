import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import * as FileSystem from 'expo-file-system';
import { AndroidAudioEncoder } from 'expo-av/build/Audio';

const QueryInputScreen: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [encodedOutputAudio, setEncodedOutputAudio] = useState<string | null>(null);
  const [outputText, setOutputText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 

  // Function to handle image upload
  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const photoUri = pickerResult.assets[0].uri;
      setSelectedImage(photoUri);
    } else {
      Alert.alert('No image selected', 'You did not select any image.');
    }
  };

  // Function to handle audio recording and save it as .wav
  const startRecording = async () => {
    console.log(Audio.RecordingOptionsPresets.HIGH_QUALITY)
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        {"android": {"audioEncoder": 3, "bitRate": 128000, "extension": ".wav", "numberOfChannels": 2, "outputFormat": 2, "sampleRate": 44100}, "ios": {"audioQuality": 127, "bitRate": 128000, "extension": ".wav", "linearPCMBitDepth": 16, "linearPCMIsBigEndian": false, "linearPCMIsFloat": false, "numberOfChannels": 2, "sampleRate": 44100}, "isMeteringEnabled": true, "web": {"bitsPerSecond": 128000, "mimeType": "audio/webm"}}
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

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

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSound = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      await sound.unloadAsync();
      setPosition(0);
    }
  };

  const seekToPosition = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  // Function to send data to the backend
  const handleSubmit = async () => {
    if (!inputText && !audioUri && !selectedImage) {
      Alert.alert('Input Required', 'Please provide at least one of text, audio, or image.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', 'your_user_id'); // Replace with actual user ID
    formData.append('time_stamp', new Date().toISOString());
    formData.append('input_text', inputText);

    if (audioUri) {
      const audioFile = {
        uri: audioUri,
        name: 'audio.wav',
        type: 'audio/wav',
      };
      formData.append('audio', audioFile as any);
    }

    if (selectedImage) {
      const imageFile = {
        uri: selectedImage,
        name: 'photo.jpg',
        type: 'image/jpeg',
      };
      formData.append('image', imageFile as any);
    }

    try {
        setLoading(true);
      const response = await axios.post('https://fji6jcn5l8.execute-api.eu-north-1.amazonaws.com/query-input', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { output_audio, output_text } = response.data;
      console.log(response.data)
      // Set output text and decode audio
      const transcribed_text=output_text? output_text: "No Text"
      setOutputText(transcribed_text);
      setEncodedOutputAudio(output_audio);
    } catch (error) {
        console.log(error)
      Alert.alert('Error', 'Failed to send data to the backend');
    }finally{
        setLoading(false)
    }
  };

  // Function to play the decoded audio
  const playDecodedAudio = async () => {
    if (encodedOutputAudio) {
      const decodedAudio = `data:audio/wav;base64,${encodedOutputAudio}`;
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: decodedAudio });
      await sound.playAsync();
    }
  };

  // Function to reset all fields
  const resetFields = () => {
    setInputText('');
    setSelectedImage(null);
    setAudioUri(null);
    setEncodedOutputAudio(null);
    setOutputText(null);
    Alert.alert('Fields Reset', 'All fields have been reset.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ReminisceAI</Text>
<Text style={styles.subtitle}>
A companion for those who need gentle reminders of the past, and guidance for the present
  Helping people with Dementia through AI
</Text>
<Text style={styles.instructionText}>

  Please enter your question below.
</Text>
<TextInput
  style={styles.input}
  placeholder="Enter your question..."
  value={inputText}
  onChangeText={setInputText}
  placeholderTextColor="#888"
/>


      <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
        <Ionicons name="image" size={24} color="#fff" />
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>

      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}

      <TouchableOpacity
        style={[styles.button, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons name="mic" size={24} color="#fff" />
        <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>

      {audioUri && (
        <View style={styles.audioControlsContainer}>
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.button}
              onPress={playSound}
              disabled={!audioUri || isPlaying}
            >
              <Ionicons name="play" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={pauseSound}
              disabled={!isPlaying}
            >
              <Ionicons name="pause" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={resumeSound}
              disabled={!audioUri || isPlaying}
            >
              <Ionicons name="play-forward" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={stopSound}
              disabled={!isPlaying}
            >
              <Ionicons name="stop" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      
      {loading && <ActivityIndicator size="large" color="#6200ee" />}
      
      {outputText && (
        <View style={styles.outputContainer}>
          <Text style={styles.outputText}>Output Text: {outputText}</Text>
        </View>
      )}

      {encodedOutputAudio && (
        <TouchableOpacity style={styles.playButton} onPress={playDecodedAudio}>
          <Text style={styles.playButtonText}>Play Output Audio</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.resetButton} onPress={resetFields}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3e3e3e',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 18,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  outputContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    width: '90%',
  },
  outputText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  playButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#e53935',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
  sliderContainer: {
    width: '90%',
    alignItems: 'center',
    marginVertical: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  positionText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  audioControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    width: '90%',
  },
});

export default QueryInputScreen;