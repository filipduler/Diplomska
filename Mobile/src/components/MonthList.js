import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TimeItem } from './TimeItem';
import * as Request from '../../services/requests';
import * as DateHelper from '../../helpers/date';
import {
    SafeAreaView,
    Text,
    SectionList,
    StyleSheet,
} from 'react-native';
import { CheckInOut } from './CheckInOut'


const getDaysList = (month, year, values) => {
    let arr = [];
    const days = DateHelper.getDaysInMonth(month, year);
    for (const day of days) {
        arr.push({
            day: `${DateHelper.getDayOfWeek(day)}, ${day.getDate()}`,
            data: (values[day.getDate()] || []).map(x => toTimeEntry(x))
        })
    }
    return arr;
}

const toTimeEntry = (entry) => {
    const start = new Date(entry.startTimeUtc);
    const end = new Date(entry.endTimeUtc);

    return {
        id: entry.id,
        start: start,
        end: end,
        title: `${DateHelper.getTime(start)} - ${DateHelper.getTime(end)}`,
        notePreview: entry.note,
    };
}

export const MonthList = ({ navigation }) => {
    const [days, setDays] = useState(getDaysList(5, 2022, {}));
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
        const res = await Request.getTimeEntries(5, 2022);
        if (res && res.ok) {
            setDays(getDaysList(5, 2022, res.payload.days));
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
            <SectionList
                sections={days}
                refreshing={refreshing} onRefresh={refreshMonthlyEntries}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => {
                    return <TimeItem 
                        data={item} 
                        handleDelete={() => deleteItem(item.id)} 
                        handleDetails={() => navigation.push('Details', { entry: item })}
                    />;
                }}
                renderSectionHeader={({ section }) => (
                    <Text style={styles.header}>{section.day}</Text>
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
});

