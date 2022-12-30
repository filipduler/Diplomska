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
    Button,
    Text
} from 'react-native';
import TimeOffList from './components/TimeOffList';

const ListView = ({ navigation }) => {

    const [daysOffLeft, setDaysOffLeft] = useState(0);
    const [entries, setEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            getDaysOff();
        }, [])
    )

    const getDaysOff = async () => {
        const response = await Requests.getDaysOffLeft();
        if(response && response.ok) {
            setDaysOffLeft(response.payload);
        }
    }

    const navigateToDetails = (timeOffId) => navigation.navigate('Details', { id: timeOffId });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text>Days left {daysOffLeft}</Text>
                <TimeOffList onItemPress={navigateToDetails} pendingOnly={false}/>
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