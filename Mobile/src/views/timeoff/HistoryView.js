import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import BaseHistoryList from '../components/BaseHistoryList'

const HistoryView = ({ route, navigation }) => {
    const { id } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <BaseHistoryList id={id} type="timeoff"/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});


export default HistoryView;