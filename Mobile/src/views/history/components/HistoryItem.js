import React, { useState } from 'react';
import { Button, Text } from 'react-native';

const HistoryItem = ({ navigation }) => {
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

export default HistoryItem;