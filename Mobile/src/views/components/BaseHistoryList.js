import React, { useState } from 'react';
import { View, Text, SafeAreaView, SectionList, StyleSheet } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import BaseBold from '../components/BaseBold'
import MiscServices from 'mobile/src/services/misc';

const prepareTimeOffHistory = (log) => {
    let res = null;
    const who = log.modifiedByOwner ? 'You' : log.ModifierName;
    switch (log.action) {
        case 'RequestOpen':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>New request opened</BaseBold>
                    <Text style={styles.bodyRow}>
                        <BaseBold>from</BaseBold> {DateHelper.formatFullDate(log.startTimeUtc)}{'\n'}
                        <BaseBold>to</BaseBold> {DateHelper.formatFullDate(log.endTimeUtc)}{'\n'}
                        <BaseBold>type</BaseBold> {log.type}
                    </Text>
                </View>
            )
            break;
        case 'RequestClosed':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>{who} closed the request</BaseBold>
                    <Text style={styles.bodyRow}>
                        <BaseBold>status</BaseBold> {MiscServices.getTimeOffStatusName(log.status)}
                    </Text>
                </View>
            )
            break;
        case 'TimeChange':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>{who} changed the time</BaseBold>
                    <Text style={styles.bodyRow}>
                        <BaseBold>from</BaseBold> {DateHelper.formatFullDate(log.startTimeUtc)}{'\n'}
                        <BaseBold>to</BaseBold> {DateHelper.formatFullDate(log.endTimeUtc)}
                    </Text>
                </View>
            )
            break;
        case 'TypeChange':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>{who} changed the request type</BaseBold>
                    <Text>
                        <BaseBold>to</BaseBold> {log.type}
                    </Text>
                </View>
            )
            break;
    }
    return res;
}

const prepareTimeEntryHistory = (log) => {
    let res = null;
    const who = log.modifiedByOwner ? 'You' : log.ModifierName;
    switch (log.action) {
        case 'EntryCreated':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>New entry created</BaseBold>
                    <Text style={styles.bodyRow}>
                    <BaseBold>from:</BaseBold> {DateHelper.formatFullDate(log.startTimeUtc)}{'\n'}
                        <BaseBold>to:</BaseBold> {DateHelper.formatFullDate(log.endTimeUtc)}
                    </Text>
                </View>
            )
            break;
        case 'EntryDeleted':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>{who} removed the entry</BaseBold>
                </View>
            )
            break;
        case 'TimeChange':
            res = (
                <View>
                    <BaseBold style={styles.headerRow}>{who} changed the time</BaseBold>
                    <Text style={styles.bodyRow}>
                        <BaseBold>from</BaseBold> {DateHelper.formatFullDate(log.startTimeUtc)}{'\n'}
                        <BaseBold>to</BaseBold> {DateHelper.formatFullDate(log.endTimeUtc)}
                    </Text>
                </View>
            )
            break;
    }
    return res;
}

const BaseHistoryList = ({ id, type }) => {

    const [keys, setKeys] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus BaseHistoryView');
            loadHistory();

            return () => {
                //on unfocus
                console.log('unfocus BaseHistoryView');
            };
        }, [])
    )

    const loadHistory = async () => {
        let arr = [];

        try{
            let prepDataFunction = null;
            let response = null;
            if (type === 'timeentry') {
                response = await Requests.getTimeEntryHistory(id);
                prepDataFunction = prepareTimeEntryHistory;
            }
            else if (type === 'timeoff') {
                response = await Requests.getTimeOffHistory(id);
                prepDataFunction = prepareTimeOffHistory;
            }
            console.log(response);
            if (response && response.ok &&  response.payload) {
                const items = response.payload;
    
                for (const key of Object.keys(items)) {
                    arr.push({
                        text: DateHelper.formatFullDate(key),
                        data: items[key].map(log => prepDataFunction(log))
                    });
                }
            }
        } finally{
            setKeys(arr);
        }
    }

    return (
        <SectionList
            sections={keys}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => item}
            renderSectionHeader={({ section }) => <Text style={styles.header}>{section.text}</Text>}
        />
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 19,
        fontWeight: '500'
    },
    headerRow: {
        fontSize: 17,
        fontWeight: '400',
        paddingLeft: 15,
    },
    bodyRow: {
        fontSize: 15,
        fontWeight: '400',
        paddingLeft: 40,
    },
});

export default BaseHistoryList;