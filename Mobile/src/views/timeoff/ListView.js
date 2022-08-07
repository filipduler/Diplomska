import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import StyleService from 'mobile/src/services/styles';
import {
    SafeAreaView,
    View,
    StyleSheet,
    FlatList,
    Button
} from 'react-native';
import TimeOffItem from './components/TimeOffItem';

const ListView = ({ navigation }) => {

    const [entries, setEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus ListView');
            getEntries()

            return () => {
                //on unfocus
                console.log('unfocus ListView');
            };
        }, [])
    )

    const getEntries = async () => {
        let arr = [];
        try {
            const response = await Requests.getTimeOffEntries();
            if (response && response.ok && response.payload) {
                for (const entry of response.payload) {
                    arr.push({
                        id: entry.id,
                        startTime: DateHelper.convertUTCToLocal(entry.startTimeUtc),
                        endTime: DateHelper.convertUTCToLocal(entry.endTimeUtc),
                        type: entry.type,
                        status: entry.status
                    });
                }
            }
        } finally {
            setEntries(arr);
            setRefreshing(false);
        }

    }

    const navigateToDetails = (timeOffId) => navigation.navigate('Details', { id: timeOffId });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <FlatList
                    refreshing={refreshing}
                    onRefresh={getEntries}
                    data={entries}
                    renderItem={({ item }) => <TimeOffItem data={item} handleEntryDetails={navigateToDetails} />}
                />
                <Button title='New Request' onPress={() => navigateToDetails(0)} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 20
    },
});
export default ListView;