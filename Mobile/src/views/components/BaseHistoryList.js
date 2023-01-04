import React, { useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import BaseBold from '../components/BaseBold'
import MiscServices from 'mobile/src/services/misc';
import { EntryType } from 'mobile/src/services/constants';
import _ from 'lodash';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';

const getWho = (log) => log.modifiedByOwner ? 'You' : log.ModifierName;

const prepareItem = (icon, header, time, content) => { return { icon, header, time, content } };

const prepareTimeOffHistory = (log) => {
    const who = getWho(log);
    switch (log.action) {
        case 'RequestOpen':
            return prepareItem(
                'arrow-right',
                `${who} opened a new request`,
                log.insertedOnUtc,
                <>
                    <Text>from <BaseBold>{DateHelper.formatDate(log.startTimeUtc)}</BaseBold></Text>
                    <Text>to <BaseBold>{DateHelper.formatDate(log.endTimeUtc)}</BaseBold></Text>
                    <Text>type <BaseBold>{log.type}</BaseBold></Text>
                </>
            )
        case 'RequestClosed':
            return prepareItem(
                'arrow-left',
                `${who} closed the request`,
                log.insertedOnUtc,
                <Text>with status <BaseBold>{MiscServices.getTimeOffStatusName(log.status)}</BaseBold></Text>);
        case 'TimeChange':
            return prepareItem(
                'clock-o',
                `${who} changed the time`,
                log.insertedOnUtc,
                <>
                    <Text>from <BaseBold>{DateHelper.formatDate(log.startTimeUtc)}</BaseBold></Text>
                    <Text>to <BaseBold>{DateHelper.formatDate(log.endTimeUtc)}</BaseBold></Text>
                </>);
        case 'TypeChange':
            return prepareItem(
                'file',
                `${who} changed the request type`,
                log.insertedOnUtc,
                <Text>to <BaseBold>{log.type}</BaseBold></Text>);
        default: throw 'invalid log action'
    }
}

const prepareTimeEntryHistory = (log) => {
    const who = getWho(log);
    switch (log.action) {
        case 'EntryCreated':
            return prepareItem(
                'arrow-right',
                `${who} created a new entry`,
                log.insertedOnUtc,
                <>
                    <Text>from <BaseBold>{DateHelper.formatFullDate(log.startTimeUtc)}</BaseBold></Text>
                    <Text>to <BaseBold>{DateHelper.formatFullDate(log.endTimeUtc)}</BaseBold></Text>
                </>);
        case 'EntryDeleted':
            return prepareItem(
                'trash',
                `${who} removed the entry`,
                log.insertedOnUtc,
                null);
        case 'TimeChange':
            return prepareItem(
                'clock-o',
                `${who} changed the time`,
                log.insertedOnUtc,
                <>
                    <Text>from <BaseBold>{DateHelper.formatFullDate(log.startTimeUtc)}</BaseBold></Text>
                    <Text>to <BaseBold>{DateHelper.formatFullDate(log.endTimeUtc)}</BaseBold></Text>
                </>);
        default: throw 'invalid log action'
    }
}

const BaseHistoryList = ({ id, type }) => {
    const [keys, setKeys] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [])
    )

    const loadHistory = async () => {
        const arr = [];

        try {
            let prepDataFunction = null;
            let response = null;
            if (type === EntryType.TimeEntry) {
                response = await Requests.getTimeEntryHistory(id);
                prepDataFunction = prepareTimeEntryHistory;
            }
            else if (type === EntryType.TimeOff) {
                response = await Requests.getTimeOffHistory(id);
                prepDataFunction = prepareTimeOffHistory;
            } else {
                throw 'invalid entry type'
            }
            console.log(response);
            if (response.ok) {
                const groupedResults = _.groupBy(response.payload || [], x => DateHelper.roundToDayAsUnix(x.insertedOnUtc));

                const sortedKeys = _(groupedResults)
                    .toPairs()
                    .orderBy(0, ['desc'])
                    .map(x => parseInt(x[0]));

                for (const unix of sortedKeys) {
                    arr.push({
                        text: DateHelper.formatDate(moment.unix(unix)),
                        data: _.orderBy(groupedResults[unix], x => x.insertedOnUtc, ['desc'])
                            .map(prepDataFunction)
                    });
                }
            }
        } finally {
            setKeys(arr);
        }
    }

    return (
        <SectionList
            sections={keys}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => <View style={styles.item}>
                <View style={styles.iconColumn}>
                    <Icon name={item.icon} size={25} />
                </View>
                <View style={styles.contentColumn}>
                    <Text style={styles.typeText}>{item.header}</Text>
                    <View style={styles.contentText}>
                        {item.content}
                    </View>
                    <Text>At {DateHelper.formatTime(item.insertedOnUtc)}</Text>
                </View>
            </View >}
            renderSectionHeader={({ section }) => <Text style={styles.header}>{section.text}</Text>}
        />
    );
};

const styles = StyleSheet.create({
    item: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 5,
    },
    iconColumn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'red'
    },
    contentColumn: {
        flex: 4,
        //backgroundColor: 'green'
    },
    typeText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    contentText: {
        fontWeight: '600',
        paddingLeft: 20
    },
    header: {
        fontSize: 19,
        fontWeight: '500'
    },
    bodyRow: {
        fontSize: 15,
        fontWeight: '400',
        paddingLeft: 40,
    },
});

export default BaseHistoryList;