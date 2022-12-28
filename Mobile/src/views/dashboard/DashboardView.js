import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateHelper from 'mobile/src/helpers/date';
import Requests from 'mobile/src/services/requests';
import { Calendar } from 'react-native-calendars';

const minutesToDisplayName = (minutes) => {
    const time = DateHelper.secondsToTime(minutes * 60);
    return `${time.h}h ${time.m}m`;
}

const DashboardView = ({ navigation }) => {
    const [today, setToday] = useState('');
    const [thisMonth, setThisMonth] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            getDashboard();
        }, [])
    )

    const getDashboard = async () => {
        const response = await Requests.getTimeEntryStats();
        if (response && response.ok) {
            setToday(DateHelper.hmsFormat(response.payload.todayMinutes * 60, true, true, false));
            setThisMonth(DateHelper.hmsFormat(response.payload.thisMonthMinutes * 60, true, true, false));
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dateContainer}>
                <Calendar
                    markedDates={{
                        '2012-03-01': { marked: true, dotColor: 'blue'},
                    }}
                    // Initially visible month. Default = now
                    initialDate={'2012-03-01'}
                    // Handler which gets executed on day press. Default = undefined
                    onDayPress={day => {
                        console.log('selected day', day);
                    }}
                    // Handler which gets executed on day long press. Default = undefined
                    onDayLongPress={day => {
                        console.log('selected day', day);
                    }}
                    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                    monthFormat={'yyyy MM'}
                    // Handler which gets executed when visible month changes in calendar. Default = undefined
                    onMonthChange={month => {
                        console.log('month changed', month);
                    }}
                    // Do not show days of other months in month page. Default = false
                    hideExtraDays={true}
                    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
                    firstDay={1}
                    // Hide day names. Default = false
                    hideDayNames={false}
                    // Show week numbers to the left. Default = false
                    showWeekNumbers={true}
                    // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                    onPressArrowLeft={subtractMonth => subtractMonth()}
                    // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                    onPressArrowRight={addMonth => addMonth()}
                    // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
                    disableAllTouchEventsForDisabledDays={true}
                    // Enable the option to swipe between months. Default = false
                    enableSwipeMonths={true}
                />
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statHeader}>Today</Text>
                        <Text style={styles.statValue}>{today}</Text>
                    </View>
                    <View>
                        <Text style={styles.statHeader}>This month</Text>
                        <Text style={styles.statValue}>{thisMonth}</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    dateContainer: {
        flex: 1
    },
    statsContainer: {
        flex: 1,
        padding: 20,
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statHeader: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center'
    },
    statValue: {
        textAlign: 'center'
    }
});


export default DashboardView;