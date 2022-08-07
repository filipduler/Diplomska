import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateHelper from 'mobile/src/helpers/date';
import Requests from 'mobile/src/services/requests';

const minutesToDisplayName = (minutes) => {
    const time = DateHelper.secondsToTime(minutes * 60);
    return `${time.h}h ${time.m}m`;
}

const DashboardView = ({ navigation }) => {
    const [today, setToday] = useState(minutesToDisplayName(0));
    const [week, setWeek] = useState(minutesToDisplayName(0));
    const [thisMonth, setThisMonth] = useState(minutesToDisplayName(0));
    const [lastMonth, setLastMonth] = useState(minutesToDisplayName(0));

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus DashboardView');
            getDashboard();

            return () => {
                //on unfocus
                console.log('unfocus DashboardView');
            };
        }, [])
    )

    const getDashboard = async () => {
        const response = await Requests.getDashboard();
        console.log(response);
        if(response && response.ok){
            setToday(minutesToDisplayName(response.payload.todayMinutes));
            setWeek(minutesToDisplayName(response.payload.weekMinutes));
            setThisMonth(minutesToDisplayName(response.payload.thisMonthMinutes));
            setLastMonth(minutesToDisplayName(response.payload.lastMonthMinutes));
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dateContainer}>
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statHeader}>Today</Text>
                        <Text style={styles.statValue}>{today}</Text>
                    </View>
                    <View>
                        <Text style={styles.statHeader}>Week</Text>
                        <Text style={styles.statValue}>{week}</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statHeader}>This month</Text>
                        <Text style={styles.statValue}>{thisMonth}</Text>
                    </View>
                    <View>
                        <Text style={styles.statHeader}>Last month</Text>
                        <Text style={styles.statValue}>{lastMonth}</Text>
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