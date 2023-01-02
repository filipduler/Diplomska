import React from 'react';
import { Text, StyleSheet } from 'react-native';

const HistoryHeader = ({ section }) => {
    return (<Text style={styles.header}>{section.text}</Text>);
};

const styles = StyleSheet.create({
    header: {
        fontSize: 19,
        fontWeight: '500'
    },
});

export default HistoryHeader;