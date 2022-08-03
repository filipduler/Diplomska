import React, { useState } from 'react';
import { View, Text, SafeAreaView, SectionList, StyleSheet } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';



const HistoryListView = ({ route, navigation }) => {
    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus HistoryView');

            return () => {
                //on unfocus
                console.log('unfocus HistoryView');
            };
        }, [])
    )

    return (
        <SafeAreaView style={styles.container}>
            <Text>History list view</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});


export default HistoryListView;