import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateHelper from 'mobile/src/helpers/date';
import moment from 'moment';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const prepareDate = (date) => {
    const mDate = moment(date || moment());
    return {
        date: DateHelper.formatDate(mDate),
        raw: mDate
    };
}

const BaseDate = ({ style, value, disabled, onChange }) => {

    const [ date, setDate ] = useState(prepareDate(value));
    const [ pickerType, setPickerType ] = useState(null);

    const onDateChange = (event, selectedDate) => {
        let close = false;
        try{
            const newDate = prepareDate(selectedDate);
            setDate(newDate);
            if(isIOS && pickerType === 'date') {
                close = true;
            }
            
            if (onChange) {
                onChange(newDate.raw.toDate());
            }
        }
        finally{
            if(isAndroid || close){
                setPickerType(null);
            }
        }
        
    }

    const toggleDateType = async (type) => {
        if(isAndroid && type) {
            try {
                DateTimePickerAndroid.open({
                    value: date.raw.toDate(),
                    onChange: onDateChange,
                    mode: type,
                    is24Hour: true,
                  });
              } catch ({ code, message }) {
                console.warn('Cannot open date picker', message);
              }
        } else if(isIOS) {
            if(type === pickerType) {
                setPickerType(null);
            } else {
                setPickerType(type);
            }
        }
    }

    const prepareDateModal = (type) => {
        let res = null;
        
        if (isIOS && type === 'date') {
            res = (<DateTimePicker
                value={date.raw.toDate()}
                locale={'en_GB'}
                display="spinner"
                mode='date'
                onChange={onDateChange}
            />);
        }

        return res;
    }

    return (
        <View style={style}>
            <Button title={date.date} onPress={() => toggleDateType('date')} disabled={disabled}/>
            {prepareDateModal(pickerType)}
        </View>

    );
};


export default BaseDate;

