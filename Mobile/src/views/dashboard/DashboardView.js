import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateHelper from 'mobile/src/helpers/date';
import Requests from 'mobile/src/services/requests';
import { Calendar } from 'react-native-calendars';
import moment from 'moment/moment';
import _ from 'lodash';

const NOW = moment(Date.now()).format('YYYY-MM-DD');

const DashboardView = () => {
    const [markedDates, setMarkedDates] = useState({});

    const [stats, setStats] = useState({ today: '', thisMonth: '' });

    useFocusEffect(
        React.useCallback(() => {
            getDashboard();
        }, [])
    )

    const getDashboard = async () => {
        const response = await Requests.getTimeEntryStats();
        if (response && response.ok) {
            setStats({
                today: DateHelper.hmsFormat(response.payload.todayMinutes * 60, true, true, false),
                thisMonth: DateHelper.hmsFormat(response.payload.thisMonthMinutes * 60, true, true, false)
            })
        }

        await refreshCalendarMarkers(Date.now());
    }

    const fetchDaysOff = async (year, month) => {
        const ranges = [];

        const tfResponse = await Requests.getDaysOff(month, year);
        if (tfResponse && tfResponse.ok) {
            const daysOff = _.sortBy(tfResponse.payload, (num) => num);

            //join days together in ranges
            for (const dayOff of daysOff) {
                const rangeArr = ranges.find(x => x[x.length - 1] === dayOff - 1);
                rangeArr
                    ? rangeArr.push(dayOff)
                    : ranges.push([dayOff]);
            }
        }

        return ranges;
    }

    const fetchCompletedDays = async (year, month) => {
        const incompletedRanges = [];
        const completedRanges = [];

        const cdResponse = await Requests.getDaysCompleted(month, year);
        if (cdResponse && cdResponse.ok) {
            const daysCompleted = _.sortBy(cdResponse.payload, 'day');

            for (const completedDay of daysCompleted) {
                const targetRange = completedDay.isCompleted
                    ? completedRanges
                    : incompletedRanges;

                const rangeArr = targetRange.find(x => x[x.length - 1].day === completedDay.day - 1);
                rangeArr
                    ? rangeArr.push(completedDay.day)
                    : targetRange.push([completedDay.day]);
            }
        }

        return {
            incompletedRanges,
            completedRanges
        };
    }

    const refreshCalendarMarkers = async (timestamp) => {
        const currentDate = new Date(timestamp);
        const markedDates = {};

        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const daysOffRanges = await fetchDaysOff(year, month);
        const { incompletedRanges, completedRanges } = await fetchCompletedDays(year, month);

        const daysUsed = _.uniq([
            ..._.flatten(daysOffRanges),
            ..._.flatten(incompletedRanges),
            ..._.flatten(completedRanges)
        ]);

        const freeDays = DateHelper.getDaysInMonth(month, year)
            .filter(x => !(x.getDay() === 6 || x.getDay() === 0) && x <= new Date()) //remove weekends
            .map(x => x.getDate())
            .filter(x => !daysUsed.includes(x));
        
        const freeDaysranges = [];
        for (const freeDay of freeDays) {
            const rangeArr = freeDaysranges.find(x => x[x.length - 1] === freeDay - 1);
            rangeArr
                ? rangeArr.push(freeDay)
                : freeDaysranges.push([freeDay]);
        }


        parseRange(markedDates, freeDaysranges, 'yellow', year, month);
        parseRange(markedDates, daysOffRanges, 'red', year, month);
        parseRange(markedDates, incompletedRanges, 'yellow', year, month);
        parseRange(markedDates, completedRanges, 'green', year, month);
        
        setMarkedDates(markedDates);
    }

    const parseRange = (markedDates, rangeArray, color, year, month) => {
        for (const range of rangeArray) {
            for (let i = 0; i < range.length; i++) {
                const day = range[i];
                const date = new Date(year, month - 1, day, 0, 0, 0, 0);

                const obj = { color: color };
                if (range.length > 1) {
                    if (i === 0) {
                        obj.startingDay = true;
                    }
                    else if (i === range.length - 1) {
                        obj.endingDay = true;
                    }
                } else if (range.length === 1) {
                    obj.startingDay = true;
                    obj.endingDay = true;
                }
                markedDates[moment(date).format('YYYY-MM-DD')] = obj;
            }
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dateContainer}>
                <Calendar
                    markingType={'period'}
                    markedDates={markedDates}
                    // Initially visible month. Default = now '2012-03-01'
                    initialDate={NOW}
                    disabledDaysIndexes={[0, 1]}
                    // Handler which gets executed on day press. Default = undefined
                    onDayPress={day => {
                        
                    }}
                    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                    monthFormat={'yyyy MMMM'}
                    // Handler which gets executed when visible month changes in calendar. Default = undefined
                    onMonthChange={month => refreshCalendarMarkers(month.timestamp)}
                    // Do not show days of other months in month page. Default = false
                    hideExtraDays={true}
                    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
                    firstDay={1}
                    // Hide day names. Default = false
                    hideDayNames={false}
                    // Show week numbers to the left. Default = false
                    showWeekNumbers={true}
                    // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                    //onPressArrowLeft={subtractMonth => subtractMonth()}
                    // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                    //onPressArrowRight={addMonth => addMonth()}
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
                        <Text style={styles.statValue}>{stats.today}</Text>
                    </View>
                    <View>
                        <Text style={styles.statHeader}>This month</Text>
                        <Text style={styles.statValue}>{stats.thisMonth}</Text>
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