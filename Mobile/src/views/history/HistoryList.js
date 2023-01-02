import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SectionList, View, StyleSheet, SafeAreaView } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import moment from 'moment';
import HistoryItem from './components/HistoryItem'
import HistoryHeader from './components/HistoryHeader'
import DateTimePicker from 'mobile/src/views/components/DateTimePicker'
import LoadingView from 'mobile/src/views/components/LoadingView';
import { EntryType } from 'mobile/src/services/constants';
import _ from 'lodash';

const NOW = new Date();

const HistoryList = ({ navigation }) => {
    const [keys, setKeys] = useState([]);
    const [ filter, setFilter ] = useState({
        start: DateHelper.getDateWithOffset(-60 * 24 * 3),
        end: NOW,
    })
    const [state, setState] = useState({
        isLoading: true,
        startMaxDate: null,
        endMinDate: null,
        endMaxDate: null,
    });

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [])
    )

    useEffect(() => {
        updateDateConstraints();
        loadHistory();
    }, [ filter ]);

    const loadHistory = async () => {
        const arr = [];
        try {
            const items = await fetchHistory();
            const groupedResults = _.groupBy(items, x => DateHelper.roundToDayAsUnix(x.lastUpdateOnUtc));

            const sortedKeys = _(groupedResults)
                .toPairs()
                .orderBy(0, ['desc'])
                .map(x => parseInt(x[0]));

            for (const unix of sortedKeys) {
                arr.push({
                    text: DateHelper.formatDate(moment.unix(unix)),
                    data: _.sortBy(groupedResults[unix], item => new Date(item.lastUpdateOnUtc))
                })
            }
        }
        catch(err) {
            console.error(err);
        }
        finally {
            setKeys(arr);
            setState(state => ({
                ...state,
                isLoading: false
            }))
        }
    }

    const fetchHistory = async () => {
        console.log(filter.start, filter.end);
        const teResponse = Requests.getTimeEntryChanges(filter.start, filter.end);
        const tfResponse = Requests.getTimeOffChanges(filter.start, filter.end);
        await Promise.allSettled([teResponse, tfResponse]);

        const items = [];

        const appendItems = async (responsePromise, type) => {
            const res = await responsePromise;
            if (res.ok) {
                console.log('type ', type, ' count: ', (res.payload || []).length);
                for (const entry of res.payload || []) {
                    entry.type = type;
                    items.push(entry);
                }
            }
        }
        await appendItems(teResponse, EntryType.TimeEntry)
        await appendItems(tfResponse, EntryType.TimeOff)

        return _.orderBy(items, item => new Date(item.lastUpdateOnUtc), ['desc']);
    }

    const navigateToHistoryView = (id, type) => {
        if (type === EntryType.TimeEntry) {
            navigation.navigate('Tracker History', { id })
        } else if (type === EntryType.TimeOff) {
            navigation.navigate('Time Off History', { id })
        }
    }

    const updateDateConstraints = () => {
        setState(state => ({
            ...state,
            startMaxDate: filter.end,
            endMinDate: filter.start,
            endMaxDate: NOW
        }))
    }

    const onStartDateChange = (date) => {
        setFilter(filter => ({
            ...filter,
            start: date
        }));
    }

    const onEndDateChange = (date) => {
        setFilter(filter => ({
            ...filter,
            end: date
        }));
    }

    return (
        <LoadingView loading={state.isLoading} >
            <SafeAreaView style={styles.app}>
                <View style={styles.innerContainer}>
                    <SectionList
                        sections={keys}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item }) => <HistoryItem item={item} onPress={navigateToHistoryView} />}
                        renderSectionHeader={({ section }) => <HistoryHeader section={section} />}
                    />
                </View>

                <View style={styles.footerRow}>
                    <View style={styles.footerColumn}>
                        <DateTimePicker type='date'
                            value={filter.start}
                            maximumDate={state.startMaxDate}
                            onChange={onStartDateChange} />
                    </View>

                    <View style={styles.footerColumn}>
                        <DateTimePicker type='date'
                            value={filter.end}
                            minimumDate={state.endMinDate}
                            maximumDate={state.endMaxDate}
                            onChange={onEndDateChange} />
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
    footerRow: {
        flexDirection: 'row',
        marginBottom: 10
    },
    footerColumn: {
        flex: 1
    },
    innerContainer: {
        flex: 1,
        padding: 20
    },
});

export default HistoryList;