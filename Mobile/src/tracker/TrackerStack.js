import React, { useState } from 'react';
import { SectionList, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import MonthListView from './MonthListView'
import DetailsView from './DetailsView'
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const TrackerStack = () => {
    return (
        <Stack.Navigator  initialRouteName='Tracker' screenOptions={{ headerMode: 'screen' }}>
            <Stack.Screen name="Tracker" component={MonthListView} />
            <Stack.Screen name="Details" component={DetailsView} />
        </Stack.Navigator>
    );
};

export default TrackerStack;