import React, { useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import BaseBold from 'mobile/src/views/components/BaseBold'

const HistoryItem = ({ item }) => {
    return (
        <View onPress={() => navigateToHistoryView(item.id, item.type)}>
            <Text>{item.type === 'TE' ? 'Time entry' : 'Time off'}</Text>
            <BaseBold style={styles.headerRow}>changed the request type</BaseBold>
            <Text>
                <BaseBold>to</BaseBold>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 19,
        fontWeight: '500'
    },
    headerRow: {
        fontSize: 17,
        fontWeight: '400',
        paddingLeft: 15,
    },
    bodyRow: {
        fontSize: 15,
        fontWeight: '400',
        paddingLeft: 40,
    },
});

export default HistoryItem;