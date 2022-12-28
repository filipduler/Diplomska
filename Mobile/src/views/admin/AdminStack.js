import React from 'react';
import DetailsView from 'mobile/src/views/timeoff/DetailsView';
import HistoryView from 'mobile/src/views/timeoff/HistoryView';
import { createStackNavigator } from '@react-navigation/stack';
import AdminView from './AdminView';

const Stack = createStackNavigator();

const AdminStack = () => {
    return (
        <Stack.Navigator initialRouteName='Administration' screenOptions={{ headerMode: 'screen' }}>
            <Stack.Screen name="Administration" component={AdminView} options={{ title: 'Admin' }}/>
            <Stack.Screen name="Details" component={DetailsView} options={{ title: 'Time Off Details' }} />
            <Stack.Screen name="History" component={HistoryView} options={{ title: 'Time Off History' }} />
        </Stack.Navigator>
    );
};

export default AdminStack;