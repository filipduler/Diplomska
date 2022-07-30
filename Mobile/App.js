/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dashboard } from './src/Dashboard';
import { Tracker } from './src/Tracker';

import {
  useColorScheme,
} from 'react-native';
import TimeOffStack from './src/timeoff/TimeOffStack';

const Tab = createBottomTabNavigator();


const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Time Tracker" component={Tracker} />
        <Tab.Screen name="Time Off" component={TimeOffStack} options={{headerShown: false}} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;