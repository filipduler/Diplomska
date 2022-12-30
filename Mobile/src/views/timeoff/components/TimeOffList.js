import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import { TimeOffStatus } from 'mobile/src/services/constants';
import {
    FlatList
} from 'react-native';
import TimeOffItem from './TimeOffItem';
import _ from 'lodash';

const TimeOffList = ({ onItemPress, pendingOnly }) => {

    const [entries, setEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            getEntries()
        }, [])
    )

    const getEntries = async () => {
        let arr = [];
        try {
            const response = await (!pendingOnly
                ? Requests.getTimeOffEntries()
                : Requests.getTimeOffEntriesByStatus(TimeOffStatus.Pending));
                
            if (response && response.ok && response.payload) {
                for (const entry of _.orderBy(response.payload, [ 'lastChange' ], [ 'desc' ])) {
                    arr.push({
                        id: entry.id,
                        startDate: DateHelper.convertUTCToLocal(entry.startDate),
                        endDate: DateHelper.convertUTCToLocal(entry.endDate),
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
        <FlatList
            refreshing={refreshing}
            onRefresh={getEntries}
            data={entries}
            renderItem={({ item }) => <TimeOffItem data={item} handleEntryDetails={onItemPress} />}
        />
    );
};

export default TimeOffList;