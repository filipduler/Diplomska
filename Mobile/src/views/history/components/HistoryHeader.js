import React, { useState } from 'react';
import { Button, Text } from 'react-native';

const HistoryHeader = ({ navigation }) => {
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

export default HistoryHeader;