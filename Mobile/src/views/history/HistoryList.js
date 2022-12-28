import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SectionList, Text, View, StyleSheet, SafeAreaView } from 'react-native';
import BaseBold from 'mobile/src/views/components/BaseBold'
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import moment from 'moment';
import HistoryItem from './components/HistoryItem'
import HistoryHeader from './components/HistoryHeader'
import _ from 'lodash';

const TIME_ENTRY_TYPE = 'TE';
const TIME_OFF_TYPE = 'TF';

const HistoryList = ({ navigation }) => {
    const [keys, setKeys] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [])
    )

    const loadHistory = async () => {
        const arr = [];
        try {
            const items = await fetchHistory();
            const groupedResults = _.groupBy(items, x => DateHelper.roundToDayAsUnix(x.lastUpdateOnUtc));

            for (const unix of Object.keys(groupedResults)) {
                arr.push({
                    text: DateHelper.formatDate(moment.unix(unix)),
                    data: _.sortBy(groupedResults[unix], item => new Date(item.lastUpdateOnUtc))
                })
            }
        }
        finally {
            setKeys(arr);
        }
    }

    const fetchHistory = async () => {
        const teResponse = Requests.getTimeEntryChanges(null, null);
        const tfResponse = Requests.getTimeOffChanges(null, null);
        await Promise.allSettled([teResponse, tfResponse]);

        const items = [];

        const appendItems = async (responsePromise, type) => {
            const res = await responsePromise;
            if(res && res.ok && res.payload) {
                for(const entry of res.payload) {
                    entry.type = type;
                    items.push(entry);
                }
            }
        }
        await appendItems(teResponse, TIME_ENTRY_TYPE)
        await appendItems(tfResponse, TIME_OFF_TYPE)

        return items;
    }
    
    const navigateToHistoryView = (id, type) => {
        if (type === TIME_ENTRY_TYPE) {
            navigation.navigate('Tracker History', { id: id })
        } else if (type === TIME_OFF_TYPE) {
            navigation.navigate('Time Off History', { id: id })
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <SectionList
                    sections={keys}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item }) => <HistoryItem item={item} onNavigate={navigateToHistoryView}/>}
                    renderSectionHeader={({ section }) => <HistoryHeader section={section} />}
                />
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

export default HistoryList;