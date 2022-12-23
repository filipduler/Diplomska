/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardView from './src/views/dashboard/DashboardView';
import HistoryStack from './src/views/history/HistoryStack';
import TrackerStack from './src/views/tracker/TrackerStack';
import TimeOffStack from './src/views/timeoff/TimeOffStack';
import Store from './src/services/store';
import LoginView from './src/views/login/LoginView';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthContext = React.createContext();

const App = () => {

  const [loggedIn, setLoggedIn] = useState(Store.auth.isLogged);

  const authContext = React.useMemo(
    () => ({
      setLoggedInStatus: async (loggedIn) => {
        setLoggedIn(loggedIn);
      }
    }),
    []
  );

  return (
    <NavigationContainer>
      <AuthContext.Provider value={authContext}>
        {loggedIn
          ? (
            <Tab.Navigator initialRouteName='Dashboard'>
              <Tab.Screen name="Dashboard" component={DashboardView} />
              <Tab.Screen name="Time Tracker" component={TrackerStack} options={{ headerShown: false }} />
              <Tab.Screen name="Time Off" component={TimeOffStack} options={{ headerShown: false }} />
              <Tab.Screen name="History" component={HistoryStack} options={{ headerShown: false }} />
            </Tab.Navigator>
          )
          : (
            <Stack.Navigator>
              <Stack.Screen name="Login" component={LoginView} />
            </Stack.Navigator>
          )}
      </AuthContext.Provider>
    </NavigationContainer>
  );
};

export default App;