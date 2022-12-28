import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateHelper from 'mobile/src/helpers/date';
import Requests from 'mobile/src/services/requests';
import { Calendar } from 'react-native-calendars';
import moment from 'moment/moment';

const NOW = Date.now();

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

    const refreshCalendarMarkers = async (timestamp) => {
        const currentDate = new Date(timestamp);

        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const tfResponse = await Requests.getDaysOff(month, year);
        if (tfResponse && tfResponse.ok) {
            const daysOff = (tfResponse.payload || []).sort((a, b) => a - b);

            //join days together in ranges
            const ranges = [];
            for (const dayOff of daysOff) {
                const rangeArr = ranges.find(x => x[x.length - 1] === dayOff - 1);
                rangeArr
                    ? rangeArr.push(dayOff)
                    : ranges.push([dayOff]);
            }

            const markedDates = {};

            //marked days off
            for (const range of ranges) {
                for (let i = 0; i < range.length; i++) {
                    const day = range[i];
                    const date = new Date(year, month - 1, day, 0, 0, 0, 0);

                    const obj = { color: 'red' };
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

            //disable weekends
            const pivot = moment().month(month - 1).year(year).startOf('month')
            const end = moment().month(month - 1).year(year).endOf('month')

            const disabled = { disabled: true }
            while (pivot.isBefore(end)) {
                ['Saturday', 'Sunday'].forEach((day) => {
                    markedDates[pivot.day(day).format("YYYY-MM-DD")] = disabled
                })
                pivot.add(7, 'days')
            }

            

            setMarkedDates(markedDates);
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
                        console.log('selected day', day);
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