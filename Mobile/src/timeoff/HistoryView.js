import React from 'react';
import { Button, Text } from 'react-native';

const HistoryView = ({ route, navigation }) => {
    const { id } = route.params;
    return (<Text>History {id}</Text>);
};

export default HistoryView;