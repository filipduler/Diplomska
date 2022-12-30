import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import TimeItem from './components/TimeItem';
import Requests from 'mobile/src/services/requests';
import DateHelper from 'mobile/src/helpers/date';
import Store from 'mobile/src/services/store';
import {
    View,
    SafeAreaView,
    Text,
    SectionList,
    StyleSheet,
} from 'react-native';
import MonthSelector from './components/MonthSelector'
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
        timeText: DateHelper.secondsToTimeDisplay(entry.timeDiffSeconds)
    };
}

const MonthListView = ({ navigation }) => {
    let dayClickActionSheet;

    const [days, setDays] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            refreshMonthlyEntries();
        }, [])
    )

    const refreshMonthlyEntries = async () => {
        const response = await Requests.getTimeEntries(Store.currentDate.month + 1, Store.currentDate.year);
        if (response && response.ok) {
            setDays(getDaysList(response.payload.entries));
        }
        setRefreshing(false);
    }

    const deleteItem = async (timeEntryId) => {
        const response = await Requests.deleteTimeEntry(timeEntryId);

        console.log(response);
        if (response.ok) {
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
            <View style={{ padding: 20, flex: 1}}>
                <MonthSelector onUpdate={refreshMonthlyEntries} />
                <SectionList
                    sections={days}
                    refreshing={refreshing} 
                    onRefresh={refreshMonthlyEntries}
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
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontSize: 18,
        fontWeight: '500'
    }
});

export default MonthListView;