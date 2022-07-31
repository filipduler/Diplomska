import React, { useState } from 'react';
import { View, Text, SafeAreaView, SectionList, StyleSheet } from 'react-native';
import Requests from 'mobile/services/requests';
import DateHelper from 'mobile/helpers/date';
import { useFocusEffect } from '@react-navigation/native';

const formatFullDate = (date) => {
    const local = DateHelper.convertUTCToLocal(date);
    return `${DateHelper.formatDate(local)}, ${DateHelper.formatTime(local)}`;
}

const B = (props) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

const prepareHistoryEntry = (log) => {
    let res = null;
    const who = log.modifiedByOwner ? 'You' : log.ModifierName;
    switch (log.action) {
        case 'RequestOpen':
            res = (
                <View>
                    <B>New request opened</B> 
                    <Text>
                        {'\t\t'}from <B>{formatFullDate(log.startTimeUtc)}</B>
                        {'\t\t'}to <B>{formatFullDate(log.endTimeUtc)}</B>
                        {'\t\t'}of type <B>{log.type}</B>
                    </Text>
                </View>
            )
            break;
        case 'RequestClosed':
            res = (
                <View>
                    <B>{who} closed the request</B>
                    <Text>
                        {'\t\t'}status <B>{log.status}</B>
                    </Text>
                </View>
            )
            break;
        case 'TimeChange':
            res = (
                <View>
                    <B>{who} changed the time</B>
                    <Text>
                        {'\t\t'}from <B>{formatFullDate(log.startTimeUtc)}</B>
                        {'\t\t'}to <B>{formatFullDate(log.endTimeUtc)}</B>
                    </Text>
                </View>
            )
            break;
        case 'TypeChange':
            res = (
                <View>
                    <B>{who} changed the request type</B>
                    <Text>
                        {'\t\t'}to <B>{log.type}</B>
                    </Text>
                </View>
            )
            break;
    }
    return res;
}

const HistoryView = ({ route, navigation }) => {
    const { id } = route.params;

    const [keys, setKeys] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus HistoryView');
            loadHistory();

            return () => {
                //on unfocus
                console.log('unfocus HistoryView');
            };
        }, [])
    )

    const loadHistory = async () => {
        const response = await Requests.postTimeOffHistory(id);
        console.log(response);
        if (response && response.ok) {
            const items = response.payload;

            let arr = [];
            for (const key of Object.keys(items)) {
                arr.push({
                    text: formatFullDate(key),
                    data: items[key].map(log => prepareHistoryEntry(log))
                });
            }

            setKeys(arr);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <SectionList
                sections={keys}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => item}
                renderSectionHeader={({ section }) => <Text>{section.text}</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});


export default HistoryView;