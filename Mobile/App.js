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
import DashboardView from './src/views/dashboard/DashboardView';
import HistoryView from './src/views/history/HistoryView';
import TrackerStack from './src/views/tracker/TrackerStack';
import TimeOffStack from './src/views/timeoff/TimeOffStack';
import {
  useColorScheme,
} from 'react-native';

const Tab = createBottomTabNavigator();


const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardView} />
        <Tab.Screen name="Time Tracker" component={TrackerStack} options={{headerShown: false}} />
        <Tab.Screen name="Time Off" component={TimeOffStack} options={{headerShown: false}} />
        <Tab.Screen name="History" component={HistoryView} options={{headerShown: false}} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;