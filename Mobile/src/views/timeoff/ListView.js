import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Requests from 'mobile/src/services/requests';
import {
    SafeAreaView,
    View,
    StyleSheet
} from 'react-native';
import TimeOffList from './components/TimeOffList';
import LoadingView from 'mobile/src/views/components/LoadingView';
import { Text, Button } from 'react-native-paper';

const ListView = ({ navigation }) => {

    const [daysOffLeft, setDaysOffLeft] = useState(0);
    const [isListLoading, setIsListLoading] = useState(false);
    const [isDaysLeftLoading, setIsDaysLeftLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            getDaysOff();
        }, [])
    )

    const getDaysOff = async () => {
        const response = await Requests.getDaysOffLeft();
        if (response && response.ok) {
            setDaysOffLeft(response.payload);
            setIsDaysLeftLoading(true);
        }
    }

    const navigateToDetails = (timeOffId) => navigation.navigate('Details', { id: timeOffId });

    return (
        <LoadingView loading={isListLoading && isDaysLeftLoading}>
            <SafeAreaView style={styles.app}>
                <View style={styles.headerRow}>
                    <Text variant='headlineSmall'>Days left: {daysOffLeft}</Text>
                </View>
                <View style={styles.footerRow}>
                    <TimeOffList onItemPress={navigateToDetails} pendingOnly={false} onInitialLoad={() => setIsListLoading(false)} />
                    <View style={styles.buttonView}>
                        <Button mode='outlined' onPress={() => navigateToDetails(0)} >
                            New Request
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
        </LoadingView>
    );
};

const styles = StyleSheet.create({
    app: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        paddingTop: 15,
        paddingLeft: 15,
        paddingBottom: 10
    },
    footerRow: {
        flex: 1,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 30,
    },
    buttonView: {
        paddingTop: 10,
        alignItems: 'center' 
    }
});
export default ListView;