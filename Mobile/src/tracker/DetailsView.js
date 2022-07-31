import React, { useState, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/helpers/date';
import Store from 'mobile/services/store';
import Requests from 'mobile/services/requests';
import moment from 'moment';

const prepareDate = (date) => {
    const mDate = moment(date || moment());
    return {
        date: DateHelper.formatDate(mDate),
        time: DateHelper.formatTime(mDate),
        raw: mDate
    };
}

const DetailsView = ({ route, navigation }) => {
    const { day, id } = route.params;
    const [date, setDate] = useState(new Date(1598051730000));

    const [ startTime, setStartTime ] = useState(prepareDate());
    const [ endTime, setEndTime ] = useState(prepareDate());
    const [note, setNote] = useState('');
    const [picker, setPicker] = useState({ open: false });

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus DetailsView');
            if (id > 0) {
                loadEntry();
            }

            return () => {
                //on unfocus
                console.log('unfocus DetailsView');
            };
        }, [])
    )

    const loadEntry = async () => {
        const response = await Requests.getTimeEntry(id);
        console.log(response);
        if (response && response.ok) {
            /*const item = response.payload;

            const startTime = DateHelper.convertUTCToLocal(item.startTimeUtc);
            setStartTime(prepareDate(startTime));

            const endTime = DateHelper.convertUTCToLocal(item.endTimeUtc);
            setEndTime(prepareDate(endTime));

            setType(item.type.id);
            setNote(item.note);
            setStatus({
                isFinished: item.isFinished,
                isCancellable: item.isCancellable,
                label: item.status.name,
                color: StyleService.getColorFromStatus(item.status.id)
            })

            if (item.isFinished) {
                setReadonlyMode(true);
            }*/
        }
    }

    const onChange = (event, selectedDate) => {
        if (picker.setter) {
            picker.setter(prepareDate(selectedDate));
        }
        setPicker({ open: false, setter: null });
    };

    const showTimePicker = (value, setValue) => {
        setDate(value.raw.toDate());
        setPicker({ open: true, setter: setValue });
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
                    <Button title={startTime.date + '\n' + startTime.time} onPress={() => showTimePicker(startTime, setStartTime)} />
                </View>
                <View>
                    <Text>End</Text>
                    <Button title={endTime.date + '\n' + endTime.time} onPress={() => showTimePicker(endTime, setEndTime)} />
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
                        mode='date'
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

