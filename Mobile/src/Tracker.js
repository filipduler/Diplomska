import React, { useState } from 'react';
import { SectionList, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import { MonthList } from './components/MonthList'
import { TimeEntryDetails } from './TimeEntryDetails'
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export const Tracker = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Tracker" component={MonthList} options={{headerShown: false}}/>
            <Stack.Screen name="Details" component={TimeEntryDetails} />
        </Stack.Navigator>
    );
};

