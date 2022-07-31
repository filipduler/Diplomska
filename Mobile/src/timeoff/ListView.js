import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Requests from 'mobile/services/requests';
import DateHelper from 'mobile/helpers/date';
import StyleService from 'mobile/services/styles';
import {
    SafeAreaView,
    Text,
    StyleSheet,
    FlatList,
    Button
} from 'react-native';
import TimeOffItem from './components/TimeOffItem';
 
const ListView = ({ navigation }) => {
    const [entries, setEntries] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus TimeOffList');
            getEntries()

            return () => {
                //on unfocus
                console.log('unfocus TimeOffList');
            };
        }, [])
    )

    const getEntries = async () => {
        let arr = [];
        const response = await Requests.getTimeOffEntries();
        if(response && response.ok && response.payload) {
            for(const entry of response.payload) {
                arr.push({
                    id: entry.id,
                    startTime: DateHelper.convertUTCToLocal(entry.startTimeUtc),
                    endTime: DateHelper.convertUTCToLocal(entry.endTimeUtc),
                    type: entry.type,
                    status: entry.status
                });
            }
        }
        setEntries(arr);
    }

    const navigateToDetails = (timeOffId) => navigation.navigate('Details', { id: timeOffId });

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={entries}
                renderItem={({item}) => <TimeOffItem data={item} handleEntryDetails={navigateToDetails}/>}
            />
            <Button title='New Request' onPress={() => navigateToDetails(0)}/>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: StyleService.colorPalette.c2
    },
    header: {
        fontSize: 20,
        backgroundColor: "#fff"
    },
    headerRow: { 
        flex: 1,
        flexDirection: 'row',
        padding: 10,
    },
    headerColumn: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: "wrap",
    }
});

export default ListView;