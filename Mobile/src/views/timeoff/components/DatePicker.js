import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import moment from 'moment';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const DatePicker = ({ style, value, disabled, onChange, minimumDate, maximumDate }) => {

    const [date, setDate] = useState(value ?? new Date());
    const [pickerType, setPickerType] = useState(null);

    const onDateChange = (event, selectedDate) => {
        let close = false;
        try {
            setDate(selectedDate);
            if (isIOS && pickerType === 'date') {
                close = true;
            }

            if (onChange) {
                onChange(selectedDate);
            }
        }
        finally {
            if (isAndroid || close) {
                setPickerType(null);
            }
        }

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
        } else if (isIOS) {
            setPickerType('date');
        }
    }

    const prepareDateModal = (type) => {
        let res = null;

        if (isIOS) {
            res = (<DateTimePicker
                value={date}
                locale={'en_GB'}
                display="spinner"
                mode='date'
                onChange={onDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
            />);
        }

        return res;
    }

    return (
        <View style={style}>
            <Button title={DateHelper.formatDate(date)} onPress={() => openDatePicker()} disabled={disabled} />
            {prepareDateModal(pickerType)}
        </View>

    );
};


export default DatePicker;

