import React from 'react';
import { Text, StyleSheet, SafeAreaView, View } from 'react-native';
import TimeOffList from '../timeoff/components/TimeOffList';
import ImpersonateUser from './components/ImpersonateUser';

const AdminView = ({ navigation }) => {

    const navigateToDetails = (timeOffId) => navigation.navigate('Details', { id: timeOffId });

    return (
        <SafeAreaView style={styles.app}>
            <View style={styles.topSection}>
                <Text style={styles.header}>View user</Text>
                <ImpersonateUser />
            </View>

            <View style={styles.bottomSection}>
                <Text style={styles.header}>Time off requests</Text>
                <TimeOffList onItemPress={navigateToDetails} pendingOnly={true} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    app: {
        flex: 1,
        padding: 20
    },
    topSection: {
        flex: 1,
    },
    bottomSection: {
        flex: 2,
    },
    header: {
        fontSize: 21,
        fontWeight: 'bold',
        marginBottom: 5
    },
});

export default AdminView;