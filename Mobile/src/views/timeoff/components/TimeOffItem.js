import React from 'react';
import DateHelper from 'mobile/src/helpers/date';
import {
    View,
    Text,
    StyleSheet,
    Pressable
} from 'react-native';
import StyleService from 'mobile/src/services/styles';
import Icon from 'react-native-vector-icons/AntDesign';

const TimeOffItem = (props) => {
    const { data, handleEntryDetails } = props;
    const start = DateHelper.formatDate(data.startTime) + '\n' + DateHelper.formatTime(data.startTime);
    const end = DateHelper.formatDate(data.endTime) + '\n' + DateHelper.formatTime(data.endTime);
    const color = StyleService.getColorFromStatus(data.status.id);

    return (
        <Pressable onPress={() => handleEntryDetails(data.id)} style={styles.itemContainer}>
            <View style={styles.itemRow}>
                <Text style={styles.itemColumn}>{start}</Text>
                <Icon name="minus" size={15} color="#900" />
                <Text style={styles.itemColumn}>{end}</Text>
                <Text style={styles.itemColumn}>{data.type.name}</Text>
                <View style={[StyleService.style.circle, { backgroundColor: color }]}></View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        height: 65
    },
    itemRow: { 
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemColumn: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '600'
    }
});

export default TimeOffItem;