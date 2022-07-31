import React, { useState, useLayoutEffect } from 'react';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/helpers/date';
import Store from 'mobile/services/store';
import Requests from 'mobile/services/requests';

const DetailsView = ({ route, navigation }) => {
    const day = route.params.day;
    console.log(day);
    const timeEntryId = route.params.timeEntryId;
    const entry = global.monthlyEntries.find(x => x.id === timeEntryId);

    const loadTime = (timeSelector) => {
        if (entry) {
            const timeUTC = new Date(timeSelector(entry));
            const time = DateHelper.convertUTCToLocal(timeUTC);

            return {
                time: time,
                text: DateHelper.getTime(time)
            };
        }
        const localDate = new Date();

        return {
            time: new Date(Store.currentDate.year, Store.currentDate.month, day, localDate.getHours(), localDate.getMinutes()),
            text: 'Set Time'
        };
    }

    const [time, setTime] = useState({ start: loadTime(x => x.startTimeUtc), end: loadTime(x => x.endTimeUtc) });
    const [note, setNote] = useState(entry?.note);

    const [date, setDate] = useState(new Date(1598051730000));
    const [picker, setPicker] = useState({ open: false });


    const onChange = (event, selectedDate) => {
        try {
            if (picker.type === 'start') {
                time.start.time = selectedDate;
                time.start.text = DateHelper.getTime(selectedDate);
            } else {
                time.end.time = selectedDate;
                time.end.text = DateHelper.getTime(selectedDate);
            }

            setTime(time)
        }
        finally {
            setPicker({ open: false });
        }
    };

    const showTimePicker = (type) => {
        setDate(type === 'start' ? time.start.time : time.end.time);
        console.log(date);
        setPicker({ open: true, type: type });
    };

    const save = async () => {
        const body = {
            startTimeUtc: time.start.time,
            endTimeUtc: time.end.time,
            note: note
        }

        if (timeEntryId > 0) {
            const res = await Requests.putUpdateEntry(timeEntryId, body);
            if (res && res.ok) {
            }
            console.log(res);
        } else {
            const res = await Requests.postNewEntry(body);
            console.log(res);
            if (res && res.ok) {
            }
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                scrollEnabled={false}
                keyboardShouldPersistTaps='handled'>
                <View>
                    <Text>Start</Text>
                    <Button title={time.start.text} onPress={(() => showTimePicker('start'))} />
                </View>
                <View>
                    <Text>End</Text>
                    <Button title={time.end.text} onPress={() => showTimePicker('end')} />
                </View>
                <View>
                    <Text>Note</Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={11}
                        value={note}
                        onChangeText={(text) => setNote(text)}
                        style={styles.textInput}
                        maxLength={512}
                        textAlignVertical='top'
                    />
                </View>

                <View>
                    <Button title='Save' onPress={save} />
                    <Button title='Delete' />
                </View>

                {picker.open && (
                    <DateTimePicker
                        value={date}
                        mode='time'
                        is24Hour={true}
                        onChange={onChange}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textInput: {
        borderColor: '#000000',
        borderWidth: 1
    }
});

export default DetailsView;

