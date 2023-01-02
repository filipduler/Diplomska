import React from 'react';
import { Text, StyleSheet } from 'react-native';

const HistoryHeader = ({ section }) => {
    return (<Text style={styles.header}>{section.text}</Text>);
};

const styles = StyleSheet.create({
    header: {
        fontSize:21,
        fontWeight: 'bold',
        marginBottom: 5
    },
});

export default HistoryHeader;