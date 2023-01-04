import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import BaseHistoryList from '../components/BaseHistoryList'
import { EntryType } from 'mobile/src/services/constants';

const HistoryView = ({ route }) => {
    const { id } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <BaseHistoryList id={id} type={EntryType.TimeOff}/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    }
});


export default HistoryView;