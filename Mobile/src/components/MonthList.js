import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TimeItem } from './TimeItem';
import * as Request from '../../services/requests';
import * as DateHelper from '../../helpers/date';
import { Store } from '../../services/store';
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


const getDaysList = (entries) => {
    let arr = [];
    const days = DateHelper.getDaysInMonth(Store.currentDate.month + 1, Store.currentDate.year);
    for (const day of days) {
        arr.push({
            day: day.getDate(),
            text: `${DateHelper.getDayOfWeek(day)}, ${day.getDate()}`,
            data: entries.filter(x => x.day === day.getDate()).map(x => toTimeEntry(x, day.getDate()))
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
        title: `${DateHelper.getTime(start)} - ${DateHelper.getTime(end)}`,
        notePreview: entry.note,
    };
}

export const MonthList = ({ navigation }) => {
    const [days, setDays] = useState(getDaysList([]));
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus');
            refreshMonthlyEntries();

            return () => {
                //on unfocus
                console.log('unfocus');
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
                        handleDetails={() => navigation.push('Details', { timeEntryId: item.id, day: item.day, onRefresh: refreshMonthlyEntries })}
                    />;
                }}
                renderSectionHeader={({ section }) => (
                    <View style={{ padding: 10, flexDirection: 'row', alignContent: "space-between" }}>
                        <View style={[styles.row, {flexDirection: 'column', backgroundColor: '#00FF00' } ]}> 
                            <Text style={styles.header}>{section.text}</Text>
                        </View>
                        <View style={[styles.row, {flexDirection: 'column', alignContent: 'flex-end', backgroundColor: '#FF0000' } ]}>
                            <Button title='New' onPress={() => navigation.push('Details', { timeEntryId: 0, day: section.day, onRefresh: refreshMonthlyEntries })} />
                        </View>
                    </View>
                )}
            />
            <CheckInOut onNewEntry={refreshMonthlyEntries} />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 22,
        backgroundColor: "#fff"
    },
    row: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 10,
      }
});

