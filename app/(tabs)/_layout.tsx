// app/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IndexScreen from './index'; // Your home screen
import ExploreScreen from './explore'; // Your explore screen
import HomeScreen from '../HomeScreen';
import PictureScreen from '../PictureScreen';
import PhotoPreviewScreen from '../PhotoPreviewScreen';
import AudioScreen from '../AudioScreen';
import QueryInputScreen from '../QueryInputScreen';
const Tab = createBottomTabNavigator();

const AppLayout = () => {
  return (
      <Tab.Navigator>
        <Tab.Screen name="Home" component={QueryInputScreen} />
        <Tab.Screen name="Upload" component={PictureScreen} />

        {/* <Tab.Screen name="Explore" component={PhotoPreviewScreen} /> */}
        <Tab.Screen name="Audio" component={AudioScreen} />
      </Tab.Navigator>
  );
};

export default AppLayout;
