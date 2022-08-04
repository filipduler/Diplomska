import React, { useState } from 'react';
import { View, Text, SafeAreaView, SectionList, StyleSheet } from 'react-native';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import { useFocusEffect } from '@react-navigation/native';
import BaseBold from '../components/BaseBold'

const prepareTimeOffHistory = (log) => {
    let res = null;
    const who = log.modifiedByOwner ? 'You' : log.ModifierName;
    switch (log.action) {
        case 'RequestOpen':
            res = (
                <View>
                    <BaseBold>New request opened</BaseBold>
                    <Text>
                        {'\t\t'}from <BaseBold>{DateHelper.formatFullDate(log.startTimeUtc)}</BaseBold>
                        {'\t\t'}to <BaseBold>{DateHelper.formatFullDate(log.endTimeUtc)}</BaseBold>
                        {'\t\t'}of type <BaseBold>{log.type}</BaseBold>
                    </Text>
                </View>
            )
            break;
        case 'RequestClosed':
            res = (
                <View>
                    <BaseBold>{who} closed the request</BaseBold>
                    <Text>
                        {'\t\t'}status <BaseBold>{log.status}</BaseBold>
                    </Text>
                </View>
            )
            break;
        case 'TimeChange':
            res = (
                <View>
                    <BaseBold>{who} changed the time</BaseBold>
                    <Text>
                        {'\t\t'}from <BaseBold>{DateHelper.formatFullDate(log.startTimeUtc)}</BaseBold>
                        {'\t\t'}to <BaseBold>{DateHelper.formatFullDate(log.endTimeUtc)}</BaseBold>
                    </Text>
                </View>
            )
            break;
        case 'TypeChange':
            res = (
                <View>
                    <BaseBold>{who} changed the request type</BaseBold>
                    <Text>
                        {'\t\t'}to <BaseBold>{log.type}</BaseBold>
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
                    <BaseBold>New entry created</BaseBold>
                    <Text>
                        {'\t\t'}from <BaseBold>{DateHelper.formatFullDate(log.startTimeUtc)}</BaseBold>
                        {'\t\t'}to <BaseBold>{DateHelper.formatFullDate(log.endTimeUtc)}</BaseBold>
                    </Text>
                </View>
            )
            break;
        case 'EntryDeleted':
            res = (
                <View>
                    <BaseBold>{who} removed the entry</BaseBold>
                </View>
            )
            break;
        case 'TimeChange':
            res = (
                <View>
                    <BaseBold>{who} changed the time</BaseBold>
                    <Text>
                        {'\t\t'}from <BaseBold>{DateHelper.formatFullDate(log.startTimeUtc)}</BaseBold>
                        {'\t\t'}to <BaseBold>{DateHelper.formatFullDate(log.endTimeUtc)}</BaseBold>
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
            renderSectionHeader={({ section }) => <Text>{section.text}</Text>}
        />
    );
};


export default BaseHistoryList;