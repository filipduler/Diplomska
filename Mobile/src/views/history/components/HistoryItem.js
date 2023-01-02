import React from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
import DateHelper from 'mobile/src/helpers/date'
import { EntryType, LogType } from 'mobile/src/services/constants';
import Icon from 'react-native-vector-icons/FontAwesome';

const logTypeVerb = (logTypeId) => {
    switch (logTypeId) {
        case LogType.Insert: return 'inserted';
        case LogType.Delete: return 'removed';
        case LogType.Update:
        default: return 'modified';
    }
}

const logTypeIconName = (logTypeId) => {
    switch (logTypeId) {
        case LogType.Insert: return 'arrow-right';
        case LogType.Delete: return 'trash';
        case LogType.Update:
        default: return 'pencil';
    }
}

const logTypeName = (type) => {
    switch (type) {
        case EntryType.TimeEntry: return 'Time entry';
        case EntryType.TimeOff: return 'Time off';
        default: return type;
    }
}

const HistoryItem = ({ item, onPress }) => {
    const who = item.modifiedByOwner ? 'You' : item.ModifierName;

    return (
        <Pressable onPress={() => onPress(item.id, item.type)}>
            <View style={styles.app}>
                <View style={styles.iconColumn}>
                    <Icon name={logTypeIconName(item.logType)} size={25} />
                </View>

                <View style={styles.contentColumn}>
                    <Text style={styles.typeText}>
                        {logTypeName(item.type)}
                    </Text>
                    <Text style={styles.contentText}>
                        {`${who} ${logTypeVerb(item.logType)} an entry`}
                    </Text>
                    <Text>
                        At {DateHelper.formatTime(item.lastUpdateOnUtc)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};


const styles = StyleSheet.create({
    app: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 5,
    },
    typeText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    contentText: {
        fontWeight: '600'
    },
    iconColumn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: 'red'
    },
    contentColumn: {
        flex: 4,
        //backgroundColor: 'green'
    },
});

export default HistoryItem;