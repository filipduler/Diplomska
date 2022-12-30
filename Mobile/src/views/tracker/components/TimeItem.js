import React, {useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Button,
    TouchableOpacity,
    Pressable
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import OpenConfirm from 'mobile/src/helpers/confirm'

let rowDict = {};
let prevOpenedRow;

const TimeItem = ({ data, handleDetails, handleDelete }) => {
    const hasDescription = !!data.notePreview;
    const rowHeight = hasDescription ? 60 : 60;

    const closeRow = (id) => {
        if (prevOpenedRow && prevOpenedRow !== rowDict[id]) {
            prevOpenedRow.close();
        }
        prevOpenedRow = rowDict[id];
    }

    const leftSwipe = () => {
        return (
            <Pressable onPress={() => OpenConfirm('Delete time entry', 'Are you sure?', 'Delete', handleDelete)} 
                activeOpacity={0.6}>
                <View style={styles.deleteBox}>
                    <Text style={styles.deleteButton}>Delete</Text>
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
                <Pressable onPress={handleDetails} style={styles.itemContainer}>
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
    deleteButton: { 
        color: '#FFFFFF', 
        fontSize: 17 
    },
    deleteBox: {
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        width: 85,
        height: 65
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

export default TimeItem;