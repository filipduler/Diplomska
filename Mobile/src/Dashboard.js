import React from 'react';
import { Button, Text } from 'react-native';

export const Dashboard = ({ navigation }) => {
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