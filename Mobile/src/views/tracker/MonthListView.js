import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import TimeItem from './components/TimeItem';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import Store from 'mobile/src/services/store';
import StyleService from 'mobile/src/services/styles';
import {
    View,
    SafeAreaView,
    Text,
    SectionList,
    StyleSheet,
    Switch,
    Button
} from 'react-native';
import CheckInOut from './components/CheckInOut'
import MonthSelector from './components/MonthSelector'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import _ from 'lodash';


const getDaysList = (entries) => {
    let arr = [];

    const entriesByDay = _.groupBy(entries, x => x.day);
    _.forEach(entriesByDay, (entries, day) => {
        const date = DateHelper.convertUTCToLocal(entries[0].startTimeUtc);

        const totalSeconds = entries
            .map(x => x.timeDiffSeconds)
            .reduce((acc, a) => acc + a, 0);

        arr.push({
            day: day,
            text: `${DateHelper.getDayOfWeek(date.day())}, ${day}`,
            data: entries.map(x => toTimeEntry(x, day)),
            dailyTotal: DateHelper.secondsToTimeDisplay(totalSeconds)
        })
    });

    return arr;
}

const toTimeEntry = (entry, day) => {
    const start = DateHelper.convertUTCToLocal(entry.startTimeUtc);
    const end = DateHelper.convertUTCToLocal(entry.endTimeUtc);

    return {
        id: entry.id,
        day: day,
        startText: DateHelper.formatTime(start),
        endText: DateHelper.formatTime(end),
        timeText: DateHelper.secondsToTimeDisplay(entry.timeDiffSeconds),
        notePreview: entry.note,
    };
}

const MonthListView = ({ navigation }) => {
    let dayClickActionSheet;

    const [isManualEnabled, setIsManualEnabled] = useState(true);
    const [days, setDays] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus MonthList');
            refreshMonthlyEntries();

            return () => {
                //on unfocus
                console.log('unfocus MonthList');
            };
        }, [])
    )

    const refreshMonthlyEntries = async () => {
        const response = await Requests.getTimeEntries(Store.currentDate.month + 1, Store.currentDate.year);
        console.log(response)
        if (response && response.ok) {
            setDays(getDaysList(response.payload.entries));
        }
        setRefreshing(false);
    }

    const deleteItem = async (timeEntryId) => {
        const res = await Requests.deleteTimeEntry(timeEntryId);
        console.log(res);
        if (res && res.ok) {
            const arr = [...days];

            for (const day of arr) {
                if (day.data.some(x => x.id === timeEntryId)) {
                    day.data = day.data.filter(x => x.id !== timeEntryId);
                    break;
                }
            }

            setDays(arr);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <MonthSelector onUpdate={refreshMonthlyEntries} />
            <SectionList
                sections={days}
                refreshing={refreshing} onRefresh={refreshMonthlyEntries}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => {
                    return <TimeItem
                        data={item}
                        handleDelete={() => deleteItem(item.id)}
                        handleDetails={() => navigation.navigate('Details', { id: item.id })}
                    />;
                }}
                renderSectionHeader={({ section }) => (
                    <View style={styles.headerRow}>
                        <Text style={[styles.headerColumn]} onPress={() => dayClickActionSheet.show()}>{section.text}</Text>
                        <Text style={[styles.headerColumn, { textAlign: 'right' }]}>Total: {section.dailyTotal}</Text>
                    </View>
                )}
            />
            <View>
                <Text>Manual</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isManualEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={state => setIsManualEnabled(state)}
                    value={isManualEnabled}
                />
            </View>
            <View>
                {isManualEnabled 
                    ? <Button title='New Entry' onPress={() => navigation.navigate('Details', { id: 0 })}/> 
                    : <CheckInOut onNewEntry={refreshMonthlyEntries} />}
            </View>


            

            <ActionSheet
                ref={o => dayClickActionSheet = o}
                title={'Select action'}
                options={['New Entry', 'History', 'Cancel']}
                cancelButtonIndex={2}
                onPress={(index) => console.log(index)}
            />
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

export default MonthListView;