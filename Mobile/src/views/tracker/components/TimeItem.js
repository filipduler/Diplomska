import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import OpenConfirm from 'mobile/src/helpers/confirm'
import Icon from 'react-native-vector-icons/FontAwesome';

const rowDict = {};
let prevOpenedRow;

const closeRow = (id) => {
    if (prevOpenedRow && prevOpenedRow !== rowDict[id]) {
        prevOpenedRow.close();
    }
    prevOpenedRow = rowDict[id];
}

const TimeItem = ({ data, onPress, onDelete }) => {
    const leftSwipe = () => {
        return (
            <Pressable onPress={() => OpenConfirm('Delete time entry', 'Are you sure?', 'Delete', onDelete)} 
                activeOpacity={0.6}>
                <View style={styles.deleteBox}>
                    <Icon name="trash-o" color='#FFFFFF' size={28}/>
                </View>
            </Pressable>
        );
    };
    return (
        <GestureHandlerRootView>
            <Swipeable renderRightActions={leftSwipe} 
                ref={ref => rowDict[data.id] = ref} 
                key={data.id}
                onBegan={() => closeRow(data.id)}>
                <Pressable onPress={onPress} style={styles.itemContainer}>
                    <View style={styles.itemRow}>
                            <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{data.startText}</Text>
                            <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{data.endText}</Text>
                            <Text style={[styles.itemColumn, { textAlign: 'right', paddingRight: 10 }]}>{data.timeText}</Text>
                    </View>
                </Pressable>
            </Swipeable>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    deleteBox: {
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        width: 85,
        height: 65
    },
    itemContainer: {
        height: 65,
        backgroundColor: 'white'
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

export default TimeItem;