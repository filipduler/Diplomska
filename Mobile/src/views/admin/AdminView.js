import React from 'react';
import { Text, StyleSheet, SafeAreaView, View } from 'react-native';
import TimeOffList from '../timeoff/components/TimeOffList';
import ImpersonateUser from './components/ImpersonateUser';

const AdminView = ({ navigation }) => {

    const navigateToDetails = (timeOffId) => navigation.navigate('Details', { id: timeOffId });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text>View user</Text>
                <ImpersonateUser />

                <Text>Time off requests</Text>
                <TimeOffList onItemPress={navigateToDetails} pendingOnly={true} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 20
    },
});

export default AdminView;