import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import DateHelper from 'mobile/src/helpers/date';
import BaseDateTime from '../components/BaseDateTime'
import Requests from 'mobile/src/services/requests';
import CheckInOut from './components/CheckInOut';

const TrackerView = ({ route, navigation }) => {
   
    const [note, setNote] = useState('');

    
    return (
        <SafeAreaView style={styles.container}>
           <CheckInOut />

           <Button title='New Entry' onPress={() => navigation.navigate('Details', { id: 0 })} />

           <Button title='Entries'onPress={() => navigation.navigate('Entries')}  />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 30
    },
    label: {
        flex: 1,
        fontSize: 20,
        fontWeight: '500'
    },
    date: {
        flex: 6,
    },
    textInput: {
        borderColor: '#000000',
        borderWidth: 1
    }
});

export default TrackerView;

