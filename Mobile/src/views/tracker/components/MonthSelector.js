import React, { useState } from 'react';
import Store from 'mobile/src/services/store';
import DateHelper from 'mobile/src/helpers/date';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

const MonthSelector = ({ onUpdate }) => {
    const [cursor, setCursor] = useState({
        year: Store.currentDate.year,
        month: Store.currentDate.month,
        monthText: DateHelper.getMonth(Store.currentDate.month)
    });

    const moveMonth = (inc) => {
        Store.currentDate.moveCursor(inc);

        setCursor(cursor => ({
            ...cursor,
            year: Store.currentDate.year,
            month: Store.currentDate.month,
            monthText: DateHelper.getMonth(Store.currentDate.month)
        }));

        //update list of items
        onUpdate();
    }

    return (
        <View style={styles.row}>
            <Icon name="angle-left" size={30}
                onPress={() => moveMonth(-1)} />
            <Text style={styles.text}>{cursor.monthText}, {cursor.year}</Text>
            <Icon name="angle-right" size={30}
                onPress={() => moveMonth(1)} />
        </View>
    );
};


const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: 'space-around',
    },
    text: {
        fontSize: 21,
        justifyContent: 'center', 
        alignItems: 'center',
        fontWeight: "500"
    }
});

export default MonthSelector;