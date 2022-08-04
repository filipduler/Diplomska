import React from 'react';
import { Button, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const DashboardView = ({ navigation }) => {
    return (
        <View>
            <Text>Dashboard</Text>
            <Icon name="left" size={30} color="#900" />
        </View>
    );
};

export default DashboardView;