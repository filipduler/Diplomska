import React from 'react';
import ListView from './ListView';
import DetailsView from './DetailsView';
import HistoryView from './HistoryView';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const TimeOffStack = () => {
    return (
        <Stack.Navigator initialRouteName='List' screenOptions={{ headerMode: 'screen' }}>
            <Stack.Screen name="List" component={ListView} options={{ title: 'Time Off' }}/>
            <Stack.Screen name="Details" component={DetailsView} options={{ title: 'Time Off Details' }} />
            <Stack.Screen name="History" component={HistoryView} options={{ title: 'Time Off History' }} />
        </Stack.Navigator>
    );
};

export default TimeOffStack;