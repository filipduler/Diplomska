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

const DetailsView = ({ route }) => {
    const isIOS =  Platform.OS === 'ios';

    const [date, setDate] = useState(new Date(1598051730000));
    const [picker, setPicker] = useState({ open: false });

    return (
        <View>
            {isIOS 
                ? <Button title='datetime'/> 
                : <>
                    <Button title='date'/>
                    <Button title='time'/>
                </>}
            
            {picker.open ?
             (isIOS ? <DateTimePicker
                    value={date}
                    mode='datetime'
                    is24Hour={true}
                    onChange={onChange}
                /> 
                : <>
                <DateTimePicker
                    value={date}
                    mode='date'
                    is24Hour={true}
                    onChange={onChange}
                />
                <DateTimePicker
                    value={date}
                    mode='time'
                    is24Hour={true}
                    onChange={onChange}
                />
                </>) : null}
        </View>
            
    );
};


export default DateTime;

