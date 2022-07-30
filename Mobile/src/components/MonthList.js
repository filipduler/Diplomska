import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TimeItem } from './TimeItem';
import * as Request from '../../services/requests';
import DateHelper from 'mobile/helpers/date';
import { Store } from '../../services/store';
import StyleService from 'mobile/services/styles';
import {
    View,
    SafeAreaView,
    Text,
    SectionList,
    StyleSheet,
    Button
} from 'react-native';
import { CheckInOut } from './CheckInOut'
import { MonthSelector } from './MonthSelector'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
 

const getDaysList = (entries) => {
    let arr = [];
    const days = DateHelper.getDaysInMonth(Store.currentDate.month + 1, Store.currentDate.year);
    for (const day of days) {
        const dayOfMonth = day.getDate();
        const dailyEntries = entries.filter(x => x.day === dayOfMonth);
        const totalSeconds = dailyEntries.map(x=>x.timeDiffSeconds).reduce((acc, a) => acc + a, 0);

        arr.push({
            day: dayOfMonth,
            text: `${DateHelper.getDayOfWeek(day)}, ${dayOfMonth}`,
            data: dailyEntries.map(x => toTimeEntry(x, dayOfMonth)),
            dailyTotal: DateHelper.secondsToTimeDisplay(totalSeconds)
        })
    }
    return arr;
}

const toTimeEntry = (entry, day) => {
    const start = new Date(entry.startTimeUtc);
    const end = new Date(entry.endTimeUtc);

    return {
        id: entry.id,
        day: day,
        startText: DateHelper.formatTime(start),
        endText: DateHelper.formatTime(end),
        timeText: DateHelper.secondsToTimeDisplay(entry.timeDiffSeconds),
        notePreview: entry.note,
    };
}

export const MonthList = ({ navigation }) => {
    let dayClickActionSheet;
    const [days, setDays] = useState(getDaysList([]));
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
        const res = await Request.getTimeEntries(Store.currentDate.month + 1, Store.currentDate.year);
        if (res && res.ok) {
            global.monthlyEntries = res.payload.entries;
            setDays(getDaysList(res.payload.entries));
        }
        setRefreshing(false);
    }

    const deleteItem = async (timeEntryId) => {
        const res = await Request.deleteTimeEntry(timeEntryId);
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
            <MonthSelector onUpdate={refreshMonthlyEntries}/>
            <SectionList
                sections={days}
                refreshing={refreshing} onRefresh={refreshMonthlyEntries}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => {
                    return <TimeItem 
                        data={item} 
                        handleDelete={() => deleteItem(item.id)} 
                        handleDetails={() => navigation.navigate('Details', { timeEntryId: item.id, day: item.day })}
                    />;
                }}
                renderSectionHeader={({ section }) => (
                    <View style={styles.headerRow}>
                        <Text style={[styles.headerColumn ]} onPress={() => dayClickActionSheet.show()}>{section.text}</Text>
                        <Text style={[styles.headerColumn, { textAlign: 'right' } ]}>Total: {section.dailyTotal}</Text>
                    </View>
                )}
            />
            <CheckInOut onNewEntry={refreshMonthlyEntries} />

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

