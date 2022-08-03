import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import moment from 'moment';

const isIOS = Platform.OS === 'ios';

const prepareDate = (date) => {
    const mDate = moment(date || moment());
    return {
        date: DateHelper.formatDate(mDate),
        time: DateHelper.formatTime(mDate),
        raw: mDate
    };
}

const BaseDateTime = ({ value, onChange }) => {

    const [date, setDate] = useState(prepareDate(value));
    const [pickerType, setPickerType] = useState(null);

    const onDateChange = (event, selectedDate) => {
        setDate(prepareDate(selectedDate));
        setPickerType(null);
        if(onChange) {
            onChange(date.raw.toDate());
        }
    }

    const prepareDateModal = (type) => {
        let res = null;
        if (isIOS && type === 'datetime') {
            res = (<DateTimePicker
                value={date.raw.toDate()}
                mode='datetime'
                is24Hour={true}
                onChange={onDateChange}
            />);
        } else if (!isIOS && type === 'date') {
            res = (<DateTimePicker
                value={date.raw.toDate()}
                mode='date'
                onChange={onDateChange}
            />);
        }
        else if (!isIOS && type === 'time') {
            res = (<DateTimePicker
                value={date.raw.toDate()}
                mode='time'
                is24Hour={true}
                onChange={onDateChange}
            />)
        }
        return res;
    }

    return (
        <View>
            {isIOS
                ? <Button title={`${date.date}, ${date.time}`} onPress={() => setPickerType('datetime')}/>
                : <>
                    <Button title={date.date} onPress={() => setPickerType('date')}/>
                    <Button title={date.time} onPress={() => setPickerType('time')}/>
                </>}
            <Text>{pickerType}</Text>
            {prepareDateModal(pickerType)}
        </View>

    );
};


export default BaseDateTime;

