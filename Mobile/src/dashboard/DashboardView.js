import React from 'react';
import { Button, Text } from 'react-native';

const DashboardView = ({ navigation }) => {
    return (
        <Button
            title="Go to Jane's profile"
            onPress={() => {
                    navigation.replace('Tracker', { name: 'Jane' })
                }
            }
        />
    );
};

export default DashboardView;