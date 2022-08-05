import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import moment from 'moment';

const prepareDate = (date) => {
    const mDate = moment(date || moment());
    return {
        date: DateHelper.formatDate(mDate),
        time: DateHelper.formatTime(mDate),
        raw: mDate
    };
}

const BaseDateTime = ({ style, value, onChange }) => {

    const [date, setDate] = useState(prepareDate(value));
    const [pickerType, setPickerType] = useState(null);

    const onDateChange = (event, selectedDate) => {
        setDate(prepareDate(selectedDate));
        if(pickerType === 'date') {
            setPickerType(null);
        }
        
        if (onChange) {
            onChange(date.raw.toDate());
        }
    }

    const toggleDateType = (type) => {
        if(type === pickerType) {
            setPickerType(null);
        } else {
            setPickerType(type);
        }
    }

    const prepareDateModal = (type) => {
        let res = null;
        if (type === 'date') {
            res = (<DateTimePicker
                value={date.raw.toDate()}
                locale={'en_GB'}
                display="inline"
                mode='date'
                onChange={onDateChange}
            />);
        }
        else if (type === 'time') {
            res = (<DateTimePicker
                value={date.raw.toDate()}
                mode='time'
                locale={'en_GB'}
                display="spinner"
                is24Hour={true}
                onChange={onDateChange}
            />)
        }
        return res;
    }

    return (
        <View style={style}>
            <Button title={date.date} onPress={() => toggleDateType('date')} />
            <Button title={date.time} onPress={() => toggleDateType('time')} />
            {prepareDateModal(pickerType)}
        </View>

    );
};


export default BaseDateTime;

