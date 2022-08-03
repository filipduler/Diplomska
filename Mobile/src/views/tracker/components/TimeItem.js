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

const SCREEN_WIDTH = Dimensions.get('window').width;

let rowDict = {};
let prevOpenedRow;

const TimeItem = (props) => {
    const hasDescription = !!props.data.notePreview;
    const rowHeight = hasDescription ? 60 : 60;

    const closeRow = (id) => {
        if (prevOpenedRow && prevOpenedRow !== rowDict[id]) {
            prevOpenedRow.close();
        }
        prevOpenedRow = rowDict[id];
    }

    const leftSwipe = () => {
        return (
            <Pressable onPress={props.handleDelete} activeOpacity={0.6}>
                <View style={styles.deleteBox}>
                    <Text style={styles.deleteButton}>Delete</Text>
                </View>
            </Pressable>
        );
    };
    return (
        <GestureHandlerRootView>
            <Swipeable renderRightActions={leftSwipe} 
                ref={ref => rowDict[props.data.id] = ref} 
                key={props.data.id}
                onBegan={() => closeRow(props.data.id)}>
                <Pressable onPress={props.handleDetails} style={styles.itemContainer}>
                    <View style={styles.itemRow}>
                            <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{props.data.startText}</Text>
                            <Text style={[styles.itemColumn, { textAlign: 'center' }]}>{props.data.endText}</Text>
                            <Text style={[styles.itemColumn, { textAlign: 'right', paddingRight: 10 }]}>{props.data.timeText}</Text>
                    </View>
                    {props.data.notePreview ? (
                        <View style={styles.itemRow}>
                            <Text style={[styles.itemColumn, { textAlign: 'center' } ]}>{props.data.notePreview}</Text>
                        </View>
                    ) : null}
                    
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