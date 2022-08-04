import React from 'react';
import TimeOffHistoryView from 'mobile/src/views/timeoff/HistoryView';
import TrackerHistoryView from 'mobile/src/views/tracker/HistoryView';
import HistoryList from './HistoryList';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const HistoryStack = () => {
    return (
        <Stack.Navigator initialRouteName='List' screenOptions={{ headerMode: 'screen' }}>
            <Stack.Screen name="List" component={HistoryList} />
            <Stack.Screen name="Tracker History" component={TrackerHistoryView} />
            <Stack.Screen name="Time Off History" component={TimeOffHistoryView} />
        </Stack.Navigator>
    );
};

export default HistoryStack;