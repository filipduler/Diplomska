import React, { useState } from 'react';
import Store from 'mobile/services/store';
import DateHelper from 'mobile/helpers/date';
import {
    View,
    Text,
    Button
} from 'react-native';

const MonthSelector = ({ onUpdate }) => {
    const [ cursor, setCursor ] = useState({ 
        year: Store.currentDate.year, 
        month: Store.currentDate.month,
        monthText: DateHelper.getMonth(Store.currentDate.month)
    });

    const moveMonth = (inc) => {
        const newCursor = Object.assign({}, cursor);
        Store.currentDate.moveCursor(inc);
        newCursor.year = Store.currentDate.year;
        newCursor.month = Store.currentDate.month;
        newCursor.monthText = DateHelper.getMonth(Store.currentDate.month);
        setCursor(newCursor);

        //update list of items
        onUpdate();
    }

    return (
        <View>
            <Button title='Previous' onPress={() => moveMonth(-1)}/>
            <Text>{cursor.monthText}, {cursor.year}</Text>
            <Button title='Next' onPress={() => moveMonth(1)}/>
        </View>
    );
};

export default MonthSelector;