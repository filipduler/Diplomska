import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, SafeAreaView, StyleSheet, View, TextInput, ScrollView } from 'react-native';
import Requests from 'mobile/services/requests';
import DateHelper from 'mobile/helpers/date';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import StyleService from 'mobile/services/styles';

const prepareDate = (date) => {
    const mDate = moment(date || moment());
    return {
        date: DateHelper.formatDate(mDate),
        time: DateHelper.formatTime(mDate),
        raw: mDate
    };
}

const DetailsView = ({ route, navigation }) => {
    const { id } = route.params;

    const [readonlyMode, setReadonlyMode] = useState(false)

    const [typeList, setTypeList] = useState([])
    const [startTime, setStartTime] = useState(prepareDate());
    const [endTime, setEndTime] = useState(prepareDate());
    const [type, setType] = useState(0);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState(null);

    const [date, setDate] = useState(new Date(1598051730000));
    const [picker, setPicker] = useState({ open: false, setter: null });

    useFocusEffect(
        React.useCallback(() => {
            //on focus
            console.log('focus DetailsView');
            if (id > 0) {
                loadEntry();
            }
            loadTypes();

            return () => {
                //on unfocus
                console.log('unfocus DetailsView');
            };
        }, [])
    )

    const loadEntry = async () => {
        setReadonlyMode(false);

        const response = await Requests.getTimeOffEntry(id);
        console.log(response);
        if (response && response.ok) {
            const item = response.payload;

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
            }
        }
    }

    const loadTypes = async () => {
        const response = await Requests.getTimeOffTypes();
        console.log(response);
        if (response && response.ok) {
            setTypeList(response.payload.map(x => {
                return { label: x.name, value: x.id }
            }));
        }
    }

    const showTimePicker = (value, setValue) => {
        setDate(value.raw.toDate());
        setPicker({ open: true, setter: setValue });
    };

    const onChange = (event, selectedDate) => {
        if (picker.setter) {
            picker.setter(prepareDate(selectedDate));
        }
        setPicker({ open: false, setter: null });
    };

    const closeRequest = async () => {
        const response = await Requests.putTimeOffCloseRequest(id);
        console.log(response);
        if (response && response.ok) {
            //refresh entry data
            await loadEntry();
        }
    }

    const save = async () => {
        const body = {
            id: id || null,
            startTime: startTime.raw.toDate(),
            endTime: endTime.raw.toDate(),
            note: note,
            typeId: type
        };

        const response = await Requests.postTimeOffSave(body);
        console.log(response);
        if (response && response.ok) {
            navigation.goBack();
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                scrollEnabled={false}
                keyboardShouldPersistTaps='handled'>
                <View>
                    <Text>Start</Text>
                    <Button disabled={readonlyMode}
                        title={startTime.date + '\n' + startTime.time}
                        onPress={(() => showTimePicker(startTime, setStartTime))} />
                </View>
                <View>
                    <Text>End</Text>
                    <Button disabled={readonlyMode}
                        title={endTime.date + '\n' + endTime.time}
                        onPress={() => showTimePicker(endTime, setEndTime)} />
                </View>
                <View>
                    <Text>Type</Text>
                    <RNPickerSelect disabled={readonlyMode}
                        value={type}
                        onValueChange={(value) => setType(value)}
                        items={typeList}
                    />
                </View>
                <View>
                    <Text>Note</Text>
                    {!readonlyMode ? (
                        <TextInput
                            multiline={true}
                            numberOfLines={11}
                            value={note}
                            onChangeText={(text) => setNote(text)}
                            style={styles.textInput}
                            maxLength={512}
                            textAlignVertical='top'
                        />
                    ) : (<Text>{note}</Text>)}

                </View>

                {status !== null && (
                    <View>
                        <View style={[styles.circle, { backgroundColor: status.color }]}></View>
                        <Text>{status.label}</Text>
                        {status.isCancellable && (
                            <Button title='Close' onPress={closeRequest} />
                        )}
                    </View>
                )}

                {id > 0 && (
                    <View>
                        <Button title='History' onPress={() => navigation.navigate('History', { id: id })} />
                    </View>
                )}

                {(id === 0 || (status !== null && !status.isFinished)) && (
                    <View>
                        <Button title='Save' onPress={save} />
                    </View>
                )}

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
    circle: {
        width: 18,
        height: 18,
        borderRadius: 18 / 2,
        borderWidth: 0.8
    },
    textInput: {
        borderColor: '#000000',
        borderWidth: 1
    }
});

export default DetailsView;