import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardView from './src/views/dashboard/DashboardView';
import HistoryStack from './src/views/history/HistoryStack';
import TrackerStack from './src/views/tracker/TrackerStack';
import TimeOffStack from './src/views/timeoff/TimeOffStack';
import Store from './src/services/store';
import LoginView from './src/views/auth/LoginView';
import { createStackNavigator } from '@react-navigation/stack';
import Requests from 'mobile/src/services/requests';
import Auth from 'mobile/src/services/auth';
import AuthLoadingView from './src/views/auth/AuthLoadingView';
import AdminStack from './src/views/admin/AdminStack';
import { Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export const AuthContext = React.createContext();

export const App = () => {

	const [loggedIn, setLoggedIn] = useState(null);

	const authContext = React.useMemo(
		() => ({
			onLogIn: async (jwtToken) => {
				await Store.auth.setJWTAsync(jwtToken);

				const response = await Requests.getUserInfo();
				if (response.ok) {
					Auth.loggedIn = true;
					await Auth.refreshUserInfo();

					setLoggedIn(true);

					console.log('successful log in');
				}
			},
			onLogOut: async () => {
				Auth.loggedIn = false;
				Auth.userInfo = null;
				await Store.auth.removeJWTAsync();
				setLoggedIn(false);
			}
		}),
		[]
	);

	if (loggedIn === null) {
		return <NavigationContainer>
			<AuthContext.Provider value={authContext}>
				<AuthLoadingView></AuthLoadingView>
			</AuthContext.Provider>
		</NavigationContainer>
	}

	const renderAuthenticatedViews = () => {
		const Tab = createBottomTabNavigator();

		return <Tab.Navigator initialRouteName='Dashboard'>
			<Tab.Screen name="Dashboard" component={DashboardView} options={{ headerRight: () => (
				<Icon name="sign-out" size={25} onPress={() => authContext.onLogOut()} style={{paddingRight: 20}} />
			)}}/>
			<Tab.Screen name="Time Tracker" component={TrackerStack} options={{ headerShown: false }} />
			<Tab.Screen name="Time Off" component={TimeOffStack} options={{ headerShown: false }} />
			<Tab.Screen name="History" component={HistoryStack} options={{ headerShown: false }} />
			{Auth.userInfo.isAdmin ? <Tab.Screen name="Admin" component={AdminStack} options={{ headerShown: false }} /> : null}
		</Tab.Navigator>
	}

	const renderUnauthenticatedViews = () => {
		const Stack = createStackNavigator();

		return <Stack.Navigator>
			<Stack.Screen name="Login" component={LoginView} />
		</Stack.Navigator>
	}

	return (
		<NavigationContainer>
			<AuthContext.Provider value={authContext}>
				{loggedIn
					? renderAuthenticatedViews()
					: renderUnauthenticatedViews()}
			</AuthContext.Provider>
		</NavigationContainer>
	);
};