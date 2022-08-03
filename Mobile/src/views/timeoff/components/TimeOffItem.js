import React, {useRef} from 'react';
import DateHelper from 'mobile/src/helpers/date';
import {
    View,
    Text,
    StyleSheet,
    Pressable
} from 'react-native';
import StyleService from 'mobile/src/services/styles';

const TimeOffItem = (props) => {
    const { data, handleEntryDetails } = props;
    const start = DateHelper.formatTime(data.startTime);
    const end = DateHelper.formatTime(data.endTime);
    const color = StyleService.getColorFromStatus(data.status.id);

    return (
        <Pressable onPress={() => handleEntryDetails(data.id)} style={styles.itemContainer}>
            <View style={styles.itemRow}>
                <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{start}</Text>
                <Text style={[styles.itemColumn, { textAlign: 'center' }]}>-</Text>
                <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{end}</Text>
                <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{data.type.name}</Text>
                <View style={[styles.circle, { backgroundColor: color }]}></View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    circle: {
        width: 18,
        height: 18,
        borderRadius: 18/2,
        borderWidth: 0.8
    },
    itemContainer: {
        height: 65
    },
    itemRow: { 
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemColumn: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: "wrap",
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default TimeOffItem;