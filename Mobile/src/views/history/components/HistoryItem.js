import React, { useState } from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
import BaseBold from 'mobile/src/views/components/BaseBold'
import DateHelper from 'mobile/src/helpers/date'
import Icon from 'react-native-vector-icons/FontAwesome';

const logTypeVerb = (logTypeId) => {
    switch(logTypeId) {
        case 1: return "inserted"
        case 3: return "removed"
        case 2: 
        default: return "modified";
    }
}


const HistoryItem = ({ item, onPress }) => {
    const start = DateHelper.formatDate(item.startTimeUtc) + '\n' + DateHelper.formatTime(item.startTimeUtc);
    const end = DateHelper.formatDate(item.endTimeUtc) + '\n' + DateHelper.formatTime(item.endTimeUtc);

    return (
        <Pressable onPress={() => onPress(item.id, item.type)}>
            <View style={styles.container}>
                <Text style={[styles.column, { fontWeight: '600', flex: 2 } ]}>
                    {`${(item.type === 'TE' ? 'Time entry' : 'Time off')} ${logTypeVerb(item.logType)}`}
                    {'\n at'} {DateHelper.formatTime(item.lastUpdateOnUtc)}
                </Text>
                <Text style={[styles.column, { fontSize: 12, flex: 1 } ]}>
                    {start}
                </Text>
                <Icon name="minus" size={18} color="#000"/>
                <Text style={[styles.column, { fontSize: 12, flex: 1 } ]}>
                    {end}
                </Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    column: {
        textAlign:'center'
    },
});

export default HistoryItem;