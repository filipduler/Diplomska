import React from 'react';
import MonthListView from './MonthListView'
import DetailsView from './DetailsView'
import HistoryView from './HistoryView'
import TrackerView from './TrackerView';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const TrackerStack = () => {
    return (
        <Stack.Navigator  initialRouteName='Tracker' screenOptions={{ headerMode: 'screen' }}>
            <Stack.Screen name="Tracker" component={TrackerView} />
            <Stack.Screen name="Entries" component={MonthListView} />
            <Stack.Screen name="Details" component={DetailsView} />
            <Stack.Screen name="History" component={HistoryView} />
        </Stack.Navigator>
    );
};

export default TrackerStack;