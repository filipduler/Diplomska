import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import { Button } from 'react-native-paper';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const DateTimePicker = ({ value, disabled, onChange, minimumDate, maximumDate }) => {
    const dateValue = value ?? new Date();

    const [date, setDate] = useState(dateValue);
    const [text, setText] = useState({
        date: '',
        time: '',
    });

    useEffect(() => {
        setText({
            date: DateHelper.formatDate(dateValue),
            time: DateHelper.formatTime(dateValue),
        });
    }, [value]);

    const onDateChange = (event, selectedDate) => {
        setDate(selectedDate);
        onChange?.call(this, selectedDate);
    }

    const openDatePicker = async () => {
        if (isAndroid) {
            try {
                DateTimePickerAndroid.open({
                    value: date,
                    onChange: onDateChange,
                    mode: 'date',
                    is24Hour: true,
                    minimumDate: minimumDate,
                    maximumDate: maximumDate
                });
            } catch ({ code, message }) {
                console.warn('Cannot open date picker', message);
            }
        }
    }

    const openTimePicker = async () => {
        if (isAndroid) {
            try {
                DateTimePickerAndroid.open({
                    value: date,
                    onChange: onDateChange,
                    mode: 'time',
                    is24Hour: true,
                    minimumDate: minimumDate,
                    maximumDate: maximumDate
                });
            } catch ({ code, message }) {
                console.warn('Cannot open time picker', message);
            }
        }
    }

    const prepareDateModal = () => {
        let res = null;

        if (isIOS) {
            res = <RNDateTimePicker
                value={date}
                locale={'en_GB'}
                display="spinner"
                mode='date'
                onChange={onDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
            />;
        }

        return res;
    }

    return (
        <View style={styles.row}>
            <View style={styles.dateCol}>
                <Button mode='outlined'
                    onPress={() => openDatePicker()}
                    disabled={disabled}
                >
                    {text.date}
                </Button>
            </View>

            <View style={styles.timeCol}>
                <Button mode='outlined'
                    onPress={() => openTimePicker()}
                    disabled={disabled}
                >
                    {text.time}
                </Button>
            </View>

            {prepareDateModal()}
        </View>

    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    dateCol: {
        flex: 2,
        alignItems: 'center'
    },
    timeCol: {
        flex: 1,
        alignItems: 'center'
    },
});

export default DateTimePicker;

