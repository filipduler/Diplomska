import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import { Button } from 'react-native-paper';

const DateTimePicker = ({ type, value, disabled, onChange, minimumDate, maximumDate }) => {
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

    const openPicker = async (mode) => {
        try {
            DateTimePickerAndroid.open({
                value: date,
                onChange: onDateChange,
                mode: mode,
                is24Hour: true,
                minimumDate: minimumDate,
                maximumDate: maximumDate
            });
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    }

    return (
        <View style={styles.row}>
            {String(type).includes('date') && <View style={styles.dateCol}>
                <Button mode='outlined'
                    onPress={() => openPicker('date')}
                    disabled={disabled}
                >
                    {text.date}
                </Button>
            </View>}

            {String(type).includes('time') && <View style={styles.timeCol}>
                <Button mode='outlined'
                    onPress={() => openPicker('time')}
                    disabled={disabled}
                >
                    {text.time}
                </Button>
            </View>}
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

