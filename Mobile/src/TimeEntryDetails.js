import React, { useState } from 'react';
import { Button, Text, SafeAreaView, View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DateHelper from '../helpers/date';

export const TimeEntryDetails = ({ route }) => {
    const { entry } = route.params;
    const [date, setDate] = useState(new Date(1598051730000));
    const [show, setShow] = useState(false);
  

    const onChange = (event, selectedDate) => {
        try{
            console.log(selectedDate)
            setDate(currentDate);
        }
        finally {
            setShow(false);
        }
    };

    const showTimePicker = (time) => {
        setDate(time)
        setShow(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text>Start</Text>
                <Button title={DateHelper.getTime(entry.end)} onPress={(() => showTimePicker(entry.start))} />
            </View>
            <View>
                <Text>End</Text>
                <Button title={DateHelper.getTime(entry.end)} onPress={() => showTimePicker(entry.end)} />
            </View>
            {show && (
                <DateTimePicker
                    value={date}
                    mode='time'
                    is24Hour={true}
                    onChange={onChange}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

