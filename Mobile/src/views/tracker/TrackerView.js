import React from 'react';
import { Button,  SafeAreaView, StyleSheet } from 'react-native';
import CheckInOut from './components/CheckInOut';

const TrackerView = ({ navigation }) => {
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
    }
});

export default TrackerView;

