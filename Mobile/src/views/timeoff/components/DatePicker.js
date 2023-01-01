import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import { Button } from 'react-native-paper';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const DatePicker = ({ style, value, disabled, onChange, minimumDate, maximumDate }) => {
    const dateValue = value ?? new Date();

    const [date, setDate] = useState(dateValue);
    const [text, setText] = useState('');

    useEffect(() => {
        setText(DateHelper.formatDate(dateValue));
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

    const prepareDateModal = () => {
        let res = null;

        if (isIOS) {
            res = <DateTimePicker
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
            <Button mode='outlined'
                onPress={() => openDatePicker()}
                disabled={disabled}
            >
                {text}
            </Button>

            {prepareDateModal()}
        </View>

    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    timeCol: {
        flex: 1,
        alignItems: 'center'
    },
});

export default DatePicker;

