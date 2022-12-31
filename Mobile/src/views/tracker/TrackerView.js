import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import CheckInOut from './components/CheckInOut';
import { Button } from 'react-native-paper';

const TrackerView = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.app}>
            <View style={styles.row} >
                <CheckInOut />
            </View>
            <View style={styles.row} >
                <Button mode='outlined'
                    uppercase={true}
                    onPress={() => navigation.navigate('Details', { id: 0 })}
                >
                    New Entry
                </Button>
            </View>
            <View style={styles.row}>
                <Button mode='outlined'
                    uppercase={true}
                    onPress={() => navigation.navigate('Entries')}
                >
                    Entries
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    app: {
        flex: 1,
        justifyContent: 'center'
    },
    row: {
        paddingTop: 30,
        paddingBottom: 30,
        alignItems: 'center'
        //backgroundColor: 'red'
    },
    mainButton: {
        width: '50%',
        fontSize: 40
    },
    statsContainer: {
        flex: 0.3,
        padding: 20,
        //backgroundColor: 'green'
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

export default TrackerView;

